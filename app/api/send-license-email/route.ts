import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { clientEmail, licenseKey, productName } = await req.json();

  const transporter = nodemailer.createTransport({
    host: process.env.CTIS_SMTP_HOST,
    port: Number(process.env.CTIS_SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.CTIS_SMTP_USER,
      pass: process.env.CTIS_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CTIS Licensing" <${process.env.CTIS_SMTP_USER}>`,
    to: clientEmail,
    subject: "Your CTIS License Activation",
    html: `
      <h2>Your License is Ready</h2>
      <p>Thank you for using CTIS software.</p>

      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>License Key:</strong></p>
      <pre style="padding:10px;background:#f4f4f4;border-radius:6px;">
${licenseKey}
      </pre>

      <p>You can now activate your software using the license key above.</p>
      <p>Regards,<br/>CTIS Support Team</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
