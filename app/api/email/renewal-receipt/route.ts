import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { email, licenseId, amount, reference } = body;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CentralCore <noreply@centralcore.com>",
      to: email,
      subject: "Annual Renewal Receipt",
      html: `
        <h2>Your Renewal is Successful</h2>
        <p>License ID: <b>${licenseId}</b></p>
        <p>Amount Paid: <b>₦${amount.toLocaleString()}</b></p>
        <p>Reference: <b>${reference}</b></p>
        <p>Thank you for renewing your annual maintenance.</p>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}
