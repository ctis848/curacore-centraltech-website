import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { requestKey } = await req.json();

  // 1. Save request in database
  const { data, error } = await supabaseAdmin
    .from("license_requests")
    .insert({
      user_id: "AUTO_FROM_AUTH", // replace with session user
      request_key: requestKey,
      status: "pending",
    });

  // 2. Email your team
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "CentralCore EMR <no-reply@centralcore.com>",
    to: "info@ctistech.com",
    subject: "New License Request",
    html: `
      <h2>New License Request</h2>
      <p>A customer has submitted a license request key:</p>
      <pre>${requestKey}</pre>
      <p>Please generate a license and reply to the customer.</p>
    `,
  });

  return NextResponse.json({ success: true });
}
