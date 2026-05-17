export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { companyName, contactName, email, phone, date } = await req.json();

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    const payload = {
      sender: { name: "CTIS Registration", email: notifyEmail },
      to: [{ email: notifyEmail }],
      subject: `New Company Signup – ${companyName}`,
      htmlContent: `
        <h2>New Company Registration</h2>

        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>Contact Person:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Registration Date:</strong> ${date}</p>
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
