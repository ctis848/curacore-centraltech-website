// FILE: app/api/admin/send-license-email/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { client_id, license_key } = await req.json();

  if (!client_id || !license_key) {
    return NextResponse.json(
      { error: "client_id and license_key are required" },
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

  // FETCH CLIENT
  const { data: client } = await supabase
    .from("clients")
    .select("email, name")
    .eq("id", client_id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
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
      <h2>Hello ${client.name ?? "Client"},</h2>
      <p>Your license key has been generated successfully.</p>
      <pre>${license_key}</pre>
      <p>Thank you,<br/>CentralCore Team</p>
    `,
  });

  return NextResponse.json({ success: true });
}
