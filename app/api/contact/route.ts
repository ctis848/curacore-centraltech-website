import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import {
  contactNotificationTemplate,
  autoReplyTemplate,
} from "@/lib/emailTemplates";

// 1. Force dynamic execution for fresh env vars and reliable runtime
export const dynamic = "force-dynamic";

// Helper to handle fetch timeouts
const fetchWithTimeout = async (url: string, options: any, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export async function POST(req: Request) {
  try {
    // 2. Resilience: Safe JSON Body Parsing
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { name, email, message, honeypot, timestamp } = body;

    // 3. Robust IP & Validation
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0].trim() || 
               req.headers.get("x-real-ip") || "unknown";

    if (honeypot && honeypot.trim() !== "") return NextResponse.json({ success: true });
    
    if (!timestamp || Date.now() - Number(timestamp) < 1500) {
      return NextResponse.json({ error: "Suspicious activity detected" }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // 4. Protection: Rate Limiting
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 5. Critical Path: Database Persistence
    const { error: dbError } = await supabaseAdmin.from("contact_messages").insert({
      name, email, message, ip_address: ip,
    });

    if (dbError) {
      console.error("❌ Database Persistence Failed:", dbError.message);
      throw new Error("Core data storage failure");
    }

    // 6. Non-Blocking Path: Email Notifications
    const BREVO_KEY = process.env.BREVO_API_KEY;
    const SENDER = process.env.SMTP_FROM;

    if (BREVO_KEY && SENDER) {
      // Execute emails in the background without blocking the main response
      (async () => {
        try {
          await Promise.all([
            fetchWithTimeout("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
              body: JSON.stringify({
                sender: { email: SENDER },
                to: [{ email: "info@ctistech.com" }, { email: "support@ctistech.com" }],
                replyTo: { email },
                subject: `New Lead: ${name}`,
                htmlContent: contactNotificationTemplate({ name, email, message, ip }),
              }),
            }),
            fetchWithTimeout("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
              body: JSON.stringify({
                sender: { email: SENDER },
                to: [{ email }],
                subject: "Message Received",
                htmlContent: autoReplyTemplate(name, message),
              }),
            })
          ]);
        } catch (emailErr) {
          console.error("⚠️ Background Email Warning:", emailErr);
        }
      })();
    }

    // 7. Fault-Tolerant Logging
    // We don't 'await' this or 'throw' if it fails—don't let logs break the user experience
    supabaseAdmin.from("activity_logs").insert({
      action: "contact_message_received",
      details: { name, email, ip },
    }).then(({ error }) => {
      if (error) console.error("⚠️ Activity log failed:", error.message);
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ CRITICAL SYSTEM ERROR:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: "A system error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Health Check confirmed by image_4a461b.png
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: "API is operational",
      timestamp: new Date().toISOString()
    }, 
    { status: 200 }
  );
}