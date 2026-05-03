import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const { clientName, clientEmail, amount, licenseType } = await req.json();

  await sendEmail({
    to: "info@ctistech.com",
    subject: "New License Payment Received",
    html: `
      <h2>License Payment Received</h2>
      <p><strong>Client:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Amount:</strong> ₦${amount}</p>
      <p><strong>License Type:</strong> ${licenseType}</p>
      <p>The client has successfully paid for their license.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
