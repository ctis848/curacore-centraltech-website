import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, licenseKey } = body || {};

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing requestId" },
        { status: 400 }
      );
    }

    if (!licenseKey || typeof licenseKey !== "string" || !licenseKey.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid licenseKey" },
        { status: 400 }
      );
    }

    // Load request
    const { data: request, error: reqError } = await supabaseAdmin
      .from("license_requests")
      .select("id, user_id, status, product_name")
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      console.error("LICENSE REQUEST LOAD ERROR:", reqError);
      return NextResponse.json(
        { success: false, error: "License request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Request is not pending" },
        { status: 400 }
      );
    }

    // Prevent duplicate license
    const { data: existingLicense } = await supabaseAdmin
      .from("licenses")
      .select("id")
      .eq("license_request_i", requestId)
      .maybeSingle();

    if (existingLicense) {
      return NextResponse.json(
        { success: false, error: "License already exists for this request" },
        { status: 400 }
      );
    }

    // Insert license
    const payload = {
      license_request_i: requestId,
      user_id: request.user_id,
      product_name: request.product_name,
      license_key: licenseKey.trim(),
      status: "ACTIVE",
      expires_at: null,
      max_activations: null,
      annual_fee_paid_: null,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("licenses")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error("LICENSE INSERT ERROR:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save license",
          supabaseMessage: insertError.message,
          supabaseDetails: insertError.details,
          supabaseHint: insertError.hint,
          supabaseCode: insertError.code,
        },
        { status: 500 }
      );
    }

    // Update request status
    const { error: updateError } = await supabaseAdmin
      .from("license_requests")
      .update({
        status: "APPROVED",
        processed_at: new Date().toISOString(),
        processed_by: "ADMIN",
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("REQUEST UPDATE ERROR:", updateError);
    }

    // Optional email to client
    try {
      const { data: userData, error: userErr } =
        await supabaseAdmin.auth.admin.getUserById(request.user_id);

      if (!userErr) {
        const email = userData?.user?.email;

        if (email && process.env.MAIL_HOST) {
          const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"CentralTech Licensing" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your License Key",
            html: `
              <h2>Your License Key</h2>
              <p>Your license for <strong>${request.product_name}</strong> has been approved.</p>
              <p><strong>License Key:</strong></p>
              <pre>${licenseKey}</pre>
            `,
          });
        }
      }
    } catch (emailErr) {
      console.error("EMAIL SEND ERROR:", emailErr);
    }

    // Audit log (optional)
    await supabaseAdmin.from("audit_logs").insert({
      action: "LICENSE_APPROVED",
      details: `Approved license request #${requestId}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "License approved and stored successfully",
      licenseId: inserted?.id ?? null,
    });
  } catch (err: any) {
    console.error("LICENSE APPROVE SERVER ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
