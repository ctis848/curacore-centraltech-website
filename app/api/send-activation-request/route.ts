import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { requestKey } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: "info@ctistech.com",
    subject: "New License Activation Request",
    text: `A client submitted a license request key:\n\n${requestKey}`,
  });

  return NextResponse.json({ success: true });
}
