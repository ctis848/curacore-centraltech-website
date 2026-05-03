import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  await sendEmail({
    to: "info@ctistech.com",
    subject: "New Support Message",
    html: `
      <h2>New Support Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
