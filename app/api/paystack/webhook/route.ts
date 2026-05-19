export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1️⃣ Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    // Only handle successful payments
    if (event.event !== "charge.success") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const payment = event.data;

    const amount = payment.amount / 100;
    const customerEmail = payment.customer.email;
    const reference = payment.reference;

    // 2️⃣ Prepare Brevo email config
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL || "info@ctistech.com";

    if (!apiKey || !notifyEmail) {
      console.error("Missing Brevo API environment variables");
      return NextResponse.json(
        { success: false, error: "Server email configuration error" },
        { status: 500 }
      );
    }

    // 3️⃣ Email to CTIS Admin
    const adminPayload = {
      sender: {
        name: "CentralCore Payment",
        email: notifyEmail,
      },
      to: [{ email: notifyEmail }],
      subject: "New Payment Received",
      htmlContent: `
        <h2>New Payment Received</h2>
        <p>A client has successfully made a payment.</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Status:</strong> Successful</p>
      `,
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminPayload),
    });

    // 4️⃣ Email receipt to the client
    const clientPayload = {
      sender: {
        name: "CentralCore Billing",
        email: notifyEmail,
      },
      to: [{ email: customerEmail }],
      subject: "Payment Receipt – CentralCore",
      htmlContent: `
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment.</p>
        <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p>Your payment has been successfully processed.</p>
        <br/>
        <p>For support, contact: info@ctistech.com</p>
      `,
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientPayload),
    });

    // 5️⃣ Respond to Paystack
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Paystack Webhook Error:", err);

    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
