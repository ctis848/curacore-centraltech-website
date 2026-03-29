// FILE: app/api/admin/licenses/approve/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { request_id, license_key } = body;

  if (!request_id || !license_key) {
    return NextResponse.json(
      { error: "request_id and license_key are required" },
      { status: 400 }
    );
  }

  // AUTH CHECK
  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // FETCH LICENSE REQUEST
  const { data: request } = await supabase
    .from("license_requests")
    .select("id, client_id")
    .eq("id", request_id)
    .single();

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // CREATE LICENSE
  const { data: license, error: licError } = await supabase
    .from("licenses")
    .insert({
      client_id: request.client_id,
      license_key,
      request_id: request.id,
      status: "active",
      activated_at: new Date().toISOString(),
      created_by_admin_id: admin.id,
    })
    .select()
    .single();

  if (licError) {
    return NextResponse.json(
      { error: "Failed to create license" },
      { status: 500 }
    );
  }

  // UPDATE REQUEST STATUS
  await supabase
    .from("license_requests")
    .update({ status: "approved" })
    .eq("id", request.id);

  // FETCH CLIENT
  const { data: client } = await supabase
    .from("clients")
    .select("email, name")
    .eq("id", request.client_id)
    .single();

  if (!client || !client.email) {
    return NextResponse.json(
      { error: "Client not found or missing email" },
      { status: 404 }
    );
  }

  // SEND EMAIL USING NODEMAILER
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "CentralCore <no-reply@centralcore.com>",
    to: client.email,
    subject: "Your License Key",
    html: `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>Hello ${client.name ?? "Client"},</h2>
        <p>Your license key has been generated successfully.</p>

        <pre style="padding: 10px; background: #f4f4f4; border-radius: 5px;">
${license_key}
        </pre>

        <p>Thank you,<br/>CentralCore Team</p>
      </div>
    `,
  });

  // CREATE NOTIFICATION
  await supabase.from("notifications").insert({
    client_id: request.client_id,
    title: "License Approved",
    message: `Your license has been approved. License Key: ${license_key}`,
  });

  return NextResponse.json({
    success: true,
    message: "License approved, email sent, notification created",
    license,
  });
}
