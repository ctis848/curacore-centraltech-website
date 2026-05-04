import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import {
  contactNotificationTemplate,
  autoReplyTemplate,
} from "@/lib/emailTemplates";

// Force Node.js runtime for better compatibility with Supabase/Brevo
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Validate JSON immediately
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, email, message, honeypot, timestamp } = body;

    // 2. IP & Bot Protection
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
    if (honeypot) return NextResponse.json({ success: true });
    
    // 3. Check Configuration BEFORE running logic
    const BREVO_KEY = process.env.BREVO_API_KEY;
    const SENDER = process.env.SMTP_FROM;

    if (!BREVO_KEY || !SENDER) {
      console.error("CRITICAL: Missing environment variables on production server.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 4. Primary Database Action (Await this)
    const { error: dbError } = await supabaseAdmin.from("contact_messages").insert({
      name, email, message, ip_address: ip,
    });

    if (dbError) throw new Error(`DB Error: ${dbError.message}`);

    // 5. Fire-and-Forget Emails (Doesn't block the response)
    // This prevents a 500 error if Brevo is slow or times out
    const sendEmails = async () => {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
          body: JSON.stringify({
            sender: { email: SENDER },
            to: [{ email: "info@ctistech.com" }, { email: "support@ctistech.com" }],
            subject: "New Message Received",
            htmlContent: contactNotificationTemplate({ name, email, message, ip }),
          }),
        });
      } catch (e) {
        console.error("Background Email Failed", e);
      }
    };
    
    sendEmails(); // Intentionally not awaited

    return NextResponse.json({ success: true });

  } catch (err: any) {
    // 6. ULTIMATE CATCH: Always return JSON
    console.error("SERVER CRASH:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ready" });
}