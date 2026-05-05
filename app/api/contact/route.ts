import { NextResponse } from "next/server";

// Force Node.js runtime for maximum compatibility with AWS Amplify and Brevo
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Safe Body Parsing: Prevents crash on empty or malformed JSON
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const { name, email, message, honeypot, timestamp } = body;

    // 2. Bot Protection: Immediate return for bots
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // 3. Robust Environment Variable Loading:
    // Trimming ensures no hidden spaces from copy-pasting into Amplify break the key.
    const BREVO_KEY = process.env.BREVO_API_KEY?.trim();
    const SENDER = process.env.SMTP_FROM?.trim();

    if (!BREVO_KEY || !SENDER) {
      console.error("DEPLOYMENT ERROR: Missing BREVO_API_KEY or SMTP_FROM in Amplify.");
      return NextResponse.json({ 
        error: "Configuration Error", 
        debug: { has_key: !!BREVO_KEY, has_sender: !!SENDER } 
      }, { status: 500 });
    }

    // 4. Fire-and-Forget Emailing:
    // We trigger the email but don't 'await' it here to ensure the user gets a 
    // fast response. Email failure won't crash the user's experience.
    const sendBrevoEmail = async () => {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_KEY,
          },
          body: JSON.stringify({
            sender: { email: SENDER, name: "CTIS Web" },
            to: [{ email: "info@ctistech.com" }],
            replyTo: { email, name },
            subject: `CTIS Lead: ${name}`,
            htmlContent: `
              <h3>New Lead from CTIS Website</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `,
          }),
        });
      } catch (err) {
        console.error("Background Email Delivery Failed:", err);
      }
    };

    sendBrevoEmail(); // Triggered in background

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("CRITICAL API ERROR:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * Verified GET health check
 */
export async function GET() {
  return NextResponse.json({ 
    status: "API is operational",
    diagnostics: {
      BREVO_READY: !!process.env.BREVO_API_KEY,
      SMTP_READY: !!process.env.SMTP_FROM,
      TIME: new Date().toISOString()
    }
  });
}