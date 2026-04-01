import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();

    // Parse body safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const rawRequestId = body?.request_id;
    const rawLicenseKey = body?.license_key;

    const request_id = typeof rawRequestId === "string" ? rawRequestId.trim() : "";
    const license_key = typeof rawLicenseKey === "string" ? rawLicenseKey.trim() : "";

    if (!request_id || !license_key) {
      return NextResponse.json(
        { error: "request_id and license_key are required" },
        { status: 400 }
      );
    }

    if (license_key.length < 10) {
      return NextResponse.json(
        { error: "License key format is invalid" },
        { status: 400 }
      );
    }

    // AUTH CHECK (Admin presence)
    const {
      data: { user: admin },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FETCH LICENSE REQUEST
    const { data: request, error: reqError } = await supabase
      .from("license_requests")
      .select("id, user_id, request_key, product_name, status")
      .eq("id", request_id)
      .maybeSingle();

    if (reqError || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status === "approved") {
      return NextResponse.json(
        { error: "This request is already approved" },
        { status: 409 }
      );
    }

    // PREVENT DUPLICATE LICENSES FOR THIS REQUEST
    const { data: existingLicense, error: existingError } = await supabase
      .from("licenses")
      .select("id")
      .eq("request_id", request.id)
      .maybeSingle();

    if (existingError) {
      console.error("Existing license check error:", existingError);
      return NextResponse.json(
        { error: "Failed to verify existing license" },
        { status: 500 }
      );
    }

    if (existingLicense) {
      return NextResponse.json(
        { error: "A license already exists for this request" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // CREATE LICENSE
    const { data: license, error: licError } = await supabase
      .from("licenses")
      .insert({
        user_id: request.user_id,
        license_key,
        request_id: request.id,
        product_name: request.product_name ?? null,
        status: "active",
        activated_at: now,
        created_at: now,
        created_by_admin_id: admin.id,
      })
      .select()
      .single();

    if (licError || !license) {
      console.error("License creation error:", licError);
      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    // LICENSE HISTORY ENTRY (for client history page)
    const { error: historyError } = await supabase.from("license_history").insert({
      user_id: request.user_id,
      license_id: license.id,
      license_key,
      product_name: request.product_name ?? null,
      status: "active",
      activated_at: now,
      created_at: now,
    });

    if (historyError) {
      console.error("License history insert error:", historyError);
      // Do not fail the whole operation; just log
    }

    // UPDATE REQUEST STATUS + STORE GENERATED LICENSE
    const { error: updateReqError } = await supabase
      .from("license_requests")
      .update({
        status: "approved",
        generated_license: license_key,
        approved_at: now,
        approved_by_admin_id: admin.id,
      })
      .eq("id", request.id);

    if (updateReqError) {
      console.error("Request update error:", updateReqError);
      // Still continue; license is created already
    }

    // FETCH CLIENT
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("email, name")
      .eq("id", request.user_id)
      .maybeSingle();

    if (clientError || !client?.email) {
      console.error("Client fetch error or missing email:", clientError);
      // We still return success, but without email
    } else {
      // SEND EMAIL TO CLIENT (best-effort)
      try {
        await sendMail({
          to: client.email,
          subject: "Your License Key is Ready",
          html: `
            <h2>Hello ${client.name ?? "Client"},</h2>
            <p>Your license request has been approved.</p>

            <p><strong>Your License Key:</strong></p>
            <pre style="padding:12px;background:#f4f4f4;border-radius:6px;">
${license_key}
            </pre>

            <p>You can now activate your software using this key.</p>
            <p>Thank you,<br/>CentralCore Team</p>
          `,
        });
      } catch (mailError) {
        console.error("Email send error:", mailError);
      }
    }

    // CREATE NOTIFICATION (for client portal)
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: request.user_id,
      title: "License Approved",
      message: `Your license has been approved. License Key: ${license_key}`,
      created_at: now,
      read: false,
    });

    if (notifError) {
      console.error("Notification insert error:", notifError);
    }

    // AUDIT LOG
    const { error: auditError } = await supabase.from("audit_logs").insert({
      admin_id: admin.id,
      action: "LICENSE_APPROVED",
      details: `Approved license request #${request.id} for user ${request.user_id}`,
      created_at: now,
      metadata: {
        request_id: request.id,
        license_id: license.id,
      },
    });

    if (auditError) {
      console.error("Audit log insert error:", auditError);
    }

    return NextResponse.json({
      success: true,
      message: "License approved and propagated to client portal.",
      license,
    });
  } catch (error: any) {
    console.error("Admin approval error:", error);
    return NextResponse.json(
      { error: "Server error", details: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
