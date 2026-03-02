import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, amount, plan, license_key, reference } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "CentralCore EMR <no-reply@centralcore.com>",
    to: email,
    subject: "Your CentralCore EMR License Receipt",
    html: `
      <h2>Payment Successful</h2>
      <p>Thank you for purchasing the <strong>${plan}</strong> license.</p>
      <p><strong>Amount:</strong> ₦${amount}</p>
      <p><strong>Transaction Ref:</strong> ${reference}</p>
      <p><strong>Your License Key:</strong></p>
      <pre style="font-size:20px;font-weight:bold">${license_key}</pre>
      <p>You can now activate your license inside the CentralCore EMR app.</p>
    `,
  });

  return NextResponse.json({ status: "sent" });
}
