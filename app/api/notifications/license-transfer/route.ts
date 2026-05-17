export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { currentOwner, newOwner, productName, licenseKey, reason } =
      await req.json();

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    const payload = {
      sender: { name: "CTIS License System", email: notifyEmail },
      to: [{ email: notifyEmail }],
      subject: `License Transfer Request – ${productName}`,
      htmlContent: `
        <h2>License Transfer Request</h2>

        <p><strong>Current Owner:</strong> ${currentOwner}</p>
        <p><strong>New Owner:</strong> ${newOwner}</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>License Key:</strong> ${licenseKey}</p>
        <p><strong>Reason:</strong> ${reason}</p>
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
