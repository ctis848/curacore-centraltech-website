import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import {
  contactNotificationTemplate,
  autoReplyTemplate,
} from "@/lib/emailTemplates";

// IMPORTANT: Brevo SDK must be imported with require()
const Brevo = require("@getbrevo/brevo");

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const { name, email, message, honeypot, timestamp } = body;

    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    if (!timestamp || Date.now() - timestamp < 1500) {
      return NextResponse.json(
        { error: "Form submitted too quickly" },
        { status: 400 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!rateLimit(ip as string, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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

    // Initialize Brevo API
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Send notification to CTIS team
    await apiInstance.sendTransacEmail({
      sender: { email: process.env.SMTP_FROM },
      to: [
        { email: "info@ctistech.com" },
        { email: "support@ctistech.com" },
      ],
      replyTo: { email },
      subject: "New Contact Message",
      htmlContent: contactNotificationTemplate({ name, email, message, ip }),
    });

    // Auto‑reply to sender
    await apiInstance.sendTransacEmail({
      sender: { email: process.env.SMTP_FROM },
      to: [{ email }],
      subject: "We received your message",
      htmlContent: autoReplyTemplate(name, message),
    });

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
