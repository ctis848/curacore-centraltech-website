import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data: license } = await supabaseAdmin
    .from("licenses")
    .select("license_key, clients(email, name)")
    .eq("id", id)
    .single();

  // SAFETY CHECK (fixes the TypeScript error)
  if (!license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "CentralCore EMR <no-reply@centralcore.com>",
    to: license.clients?.[0]?.email,
    subject: "Your CentralCore EMR License (Resent)",
    html: `
      <h2>Your License Key</h2>
      <pre>${license.license_key}</pre>
    `,
  });

  return NextResponse.json({ success: true });
}
