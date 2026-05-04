import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import {
  contactNotificationTemplate,
  autoReplyTemplate,
} from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const { name, email, message, honeypot, timestamp } = body;

    // 🛑 Honeypot spam trap
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // 🛑 Timestamp spam protection (must take at least 1.5 seconds)
    if (!timestamp || Date.now() - timestamp < 1500) {
      return NextResponse.json(
        { error: "Form submitted too quickly" },
        { status: 400 }
      );
    }

    // 🛑 Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🛑 Rate limit: 5 messages per minute per IP
    if (!rateLimit(ip as string, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 📝 Store message in DB
    await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      message,
      ip_address: ip,
    });

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { error: "Server email configuration error" },
        { status: 500 }
      );
    }

    // ⭐ SEND EMAIL TO CTIS TEAM (Brevo REST API)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { email: process.env.SMTP_FROM },
        to: [
          { email: "info@ctistech.com" },
          { email: "support@ctistech.com" },
        ],
        replyTo: { email },
        subject: "New Contact Message",
        htmlContent: contactNotificationTemplate({ name, email, message, ip }),
      }),
    });

    // ⭐ AUTO‑REPLY TO USER
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { email: process.env.SMTP_FROM },
        to: [{ email }],
        subject: "We received your message",
        htmlContent: autoReplyTemplate(name, message),
      }),
    });

    // 📝 Log activity
    await supabaseAdmin.from("activity_logs").insert({
      admin_id: null,
      action: "contact_message_received",
      details: { name, email, ip },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
