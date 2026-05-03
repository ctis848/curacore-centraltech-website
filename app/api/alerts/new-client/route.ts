import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const { name, email, phone } = await req.json();

  await sendEmail({
    to: "info@ctistech.com",
    subject: "New Client Registration",
    html: `
      <h2>New Client Registered</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p>A new client has registered on the CentralCore platform.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
