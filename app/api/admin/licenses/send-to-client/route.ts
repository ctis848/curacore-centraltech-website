import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { clientId, productName, licenseKey, maxActivations, expiresAt } = body;

    // 0. Validate input
    if (!clientId || !productName || !licenseKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize values
    maxActivations = maxActivations ? Number(maxActivations) : null;
    expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

    /* -----------------------------------------
       1. FETCH CLIENT USING clients.id
    ----------------------------------------- */
    const { data: client, error: clientErr } = await supabaseAdmin
      .from("clients")
      .select("id, email, name")
      .eq("id", clientId)
      .single();

    if (clientErr || !client) {
      console.error("CLIENT FETCH ERROR:", clientErr);
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const clientEmail = client.email;

    /* -----------------------------------------
       2. PREVENT DUPLICATE LICENSE KEYS
    ----------------------------------------- */
    const { data: existing } = await supabaseAdmin
      .from("licenses")
      .select("id")
      .eq("license_key", licenseKey)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This license key already exists" },
        { status: 409 }
      );
    }

    /* -----------------------------------------
       3. PREPARE ANNUAL SERVICE FEE WINDOW
    ----------------------------------------- */
    const now = new Date();
    const firstYearPaidUntil = new Date(now);
    firstYearPaidUntil.setFullYear(firstYearPaidUntil.getFullYear() + 1);

    /* -----------------------------------------
       4. CREATE LICENSE RECORD (using clientId)
    ----------------------------------------- */
    const { data: license, error: licenseErr } = await supabaseAdmin
      .from("licenses")
      .insert({
        client_id: clientId, // <-- NEW: direct link to clients.id
        product_name: productName,
        license_key: licenseKey,
        max_activations: maxActivations,
        expires_at: expiresAt,
        status: "ACTIVE",
        activation_count: 0,
        annual_fee_percent: 20,
        annual_fee_paid_until: firstYearPaidUntil.toISOString(),
      })
      .select()
      .single();

    if (licenseErr) {
      console.error("LICENSE CREATE ERROR:", licenseErr);
      return NextResponse.json(
        {
          error: "Failed to create license",
          supabase_error: licenseErr.message,
          supabase_hint: licenseErr.hint,
          supabase_details: licenseErr.details,
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       5. SYNC TO CLIENT PORTAL TABLE
    ----------------------------------------- */
    const { error: portalErr } = await supabaseAdmin
      .from("client_licenses")
      .insert({
        client_id: clientId,
        license_id: license.id,
        product_name: productName,
        status: "ACTIVE",
        expires_at: expiresAt,
      });

    if (portalErr) {
      console.error("CLIENT PORTAL ERROR:", portalErr);
      return NextResponse.json(
        { error: "Failed to sync license to client portal" },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       6. UPDATE ACTIVE LICENSE COUNT
    ----------------------------------------- */
    const { error: countErr } = await supabaseAdmin.rpc(
      "increment_active_license_count",
      { client_id: clientId }
    );

    if (countErr) {
      console.error("ACTIVE LICENSE COUNT ERROR:", countErr);
      return NextResponse.json(
        { error: "Failed to update active license count" },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       7. INSERT LICENSE HISTORY
    ----------------------------------------- */
    const { error: historyErr } = await supabaseAdmin
      .from("license_history")
      .insert({
        client_id: clientId,
        license_id: license.id,
        action: "LICENSE_SENT",
        details: `License for ${productName} sent to client`,
      });

    if (historyErr) {
      console.error("LICENSE HISTORY ERROR:", historyErr);
      return NextResponse.json(
        { error: "Failed to update license history" },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       8. LOG ADMIN ACTIVITY
    ----------------------------------------- */
    await supabaseAdmin.from("admin_activity_logs").insert({
      action: "SEND_LICENSE",
      description: `Sent license for ${productName} to ${clientEmail}`,
    });

    /* -----------------------------------------
       9. SEND EMAIL VIA BREVO
    ----------------------------------------- */
    if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: {
              name: "CentralTech Licensing",
              email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [{ email: clientEmail }],
            subject: "Your New Software License",
            htmlContent: `
              <h2>Your License is Ready</h2>
              <p>Hello,</p>
              <p>Your license has been issued.</p>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>License Key:</strong> ${licenseKey}</p>
              <p><strong>Max Activations:</strong> ${maxActivations || "Unlimited"}</p>
              <p><strong>Expires:</strong> ${expiresAt || "No Expiry"}</p>
              <p><strong>Annual Service Fee:</strong> 20% per year</p>
              <p><strong>Annual Fee Paid Until:</strong> ${firstYearPaidUntil.toLocaleDateString()}</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("BREVO EMAIL ERROR:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "License sent successfully",
      license,
    });
  } catch (err: any) {
    console.error("SEND LICENSE SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
