export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      companyName,
      companyEmail,
      contactName,
      dueDate,
      planName,
      amountDue,
      paymentLink,
      type, // "30days" or "7days"
    } = await req.json();

    if (!companyEmail || !companyName || !dueDate || !amountDue || !paymentLink) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    const subject =
      type === "30days"
        ? `Your Annual Subscription is Due in 30 Days`
        : `Your Annual Subscription is Due in 7 Days`;

    const intro =
      type === "30days"
        ? `This is a reminder that your annual subscription will be due in 30 days.`
        : `This is a final reminder that your annual subscription will be due in 7 days.`;

    const payload = {
      sender: { name: "CTIS Subscription", email: notifyEmail },
      to: [{ email: companyEmail }],
      cc: [{ email: notifyEmail }],
      subject,
      htmlContent: `
        <h2>Annual Subscription Reminder</h2>
        <p>Hello ${contactName},</p>
        <p>${intro}</p>

        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Renewal Date:</strong> ${dueDate}</p>
        <p><strong>Amount Due:</strong> ₦${amountDue}</p>

        <p>Renew using the secure link below:</p>
        <p><a href="${paymentLink}">${paymentLink}</a></p>

        <p>Thank you.</p>
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
