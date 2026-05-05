// force amplify rebuild

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.log("AMPLIFY_BACKEND_REDEPLOY_TRIGGER");

    // Parse JSON safely
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, email, message, honeypot, timestamp } = body;

    // Bot protection
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    if (!timestamp || Date.now() - Number(timestamp) < 1500) {
      return NextResponse.json({ error: "Suspicious activity" }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Load environment variables
    const BREVO_KEY = process.env.BREVO_API_KEY;
    const SENDER = process.env.SMTP_FROM;

    if (!BREVO_KEY || !SENDER) {
      console.error("Missing BREVO_API_KEY or SMTP_FROM");
      return NextResponse.json(
        {
          error: "Server configuration error",
          debug: { has_key: !!BREVO_KEY, has_sender: !!SENDER }
        },
        { status: 500 }
      );
    }

    // Send email to CTIS team
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER },
        to: [{ email: "info@ctistech.com" }],
        subject: `New Contact Message from ${name}`,
        htmlContent: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `,
      }),
    });

    // Auto‑reply to user
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER },
        to: [{ email }],
        subject: "We received your message",
        htmlContent: `
          <p>Hello ${name},</p>
          <p>Thank you for contacting CTIS. We have received your message and will respond shortly.</p>
        `,
      }),
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("CONTACT API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "API is operational",
    BREVO_READY: !!process.env.BREVO_API_KEY,
    SMTP_READY: !!process.env.SMTP_FROM,
    time: new Date().toISOString(),
  });
}
