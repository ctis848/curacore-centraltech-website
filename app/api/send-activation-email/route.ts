import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { key, clientEmail } = await req.json();

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
    from: `"CTIS Portal" <${process.env.CTIS_SMTP_USER}>`,
    to: "info@ctistech.com",
    subject: "New License Activation Request",
    text: `
A client has submitted a license activation request.

Client Email: ${clientEmail}

License Request Key:
${key}

Please generate the license manually and reply to the client.
    `,
  });

  return NextResponse.json({ ok: true });
}
