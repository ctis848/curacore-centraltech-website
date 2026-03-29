// FILE: app/api/admin/license-requests/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request, { params }: any) {
  try {
    const requestId = params.id;

    const { data: request, error: reqErr } = await supabaseAdmin
      .from("license_requests")
      .select("id, user_id, request_key, status, clients(email, name)")
      .eq("id", requestId)
      .single();

    if (reqErr || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const licenseKey = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    const { data: license, error: licErr } = await supabaseAdmin
      .from("licenses")
      .insert({
        client_id: request.user_id,
        license_key: licenseKey,
        status: "active",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .select()
      .single();

    if (licErr) {
      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("license_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    await supabaseAdmin.from("activity_logs").insert({
      admin_id: null,
      action: "license_approved",
      details: {
        request_id: requestId,
        license_id: license.id,
        license_key: licenseKey,
      },
    });

    await supabaseAdmin.from("audit_trails").insert({
      admin_id: null,
      entity: "license",
      entity_id: license.id,
      action: "created",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "CentralCore EMR <no-reply@centralcore.com>",
      to: request.clients?.[0]?.email,
      subject: "Your CentralCore EMR License",
      html: `
        <h2>Your License is Ready</h2>
        <p>Hello ${request.clients?.[0]?.name || "Client"},</p>
        <p>Your license request has been approved. Here is your license key:</p>
        <pre style="padding:10px;background:#f4f4f4;border-radius:6px;">
${licenseKey}
        </pre>
        <p>Thank you for choosing CentralCore EMR.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      licenseKey,
    });
  } catch (err) {
    console.error("Approval error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
