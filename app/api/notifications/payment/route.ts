export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { companyName, companyEmail, amount, paymentDate, paymentRef, paymentLink } =
      await req.json();

    if (!companyName || !companyEmail || !amount || !paymentDate || !paymentLink) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    const payload = {
      sender: { name: "CTIS Billing", email: notifyEmail },
      to: [{ email: companyEmail }],
      cc: [{ email: notifyEmail }],
      subject: `Payment Received – ${companyName}`,
      htmlContent: `
        <h2>Payment Confirmation</h2>
        <p>Hello ${companyName},</p>
        <p>Your payment has been received successfully.</p>

        <p><strong>Amount:</strong> ₦${amount}</p>
        <p><strong>Date:</strong> ${paymentDate}</p>
        <p><strong>Reference:</strong> ${paymentRef}</p>

        <p>You can download your receipt or complete additional steps here:</p>
        <p><a href="${paymentLink}">${paymentLink}</a></p>

        <p>Thank you for your payment.</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey!, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: "Brevo API failed", details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
