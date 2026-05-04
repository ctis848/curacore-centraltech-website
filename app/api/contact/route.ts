import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

    // 🛑 Timestamp spam protection
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

    // 🛑 Rate limit
    if (!rateLimit(ip as string, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 📝 Log submission
    console.log("📩 New contact submission:", {
      name,
      email,
      ip,
      time: new Date().toISOString(),
    });

    // 📝 Store message in DB
    await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      message,
      ip_address: ip,
    });

    // 🛑 Validate SMTP environment variables
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } =
      process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      console.error("❌ Missing SMTP environment variables");
      return NextResponse.json(
        { error: "Server email configuration error" },
        { status: 500 }
      );
    }

    // 🧪 Debug log
    console.log("🔧 SMTP CONFIG:", {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      from: SMTP_FROM,
    });

    // 📧 Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // SSL only on 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10_000, // prevent hanging forever
      socketTimeout: 10_000,
    });

    // 🧪 Verify SMTP connection
    console.log("🔌 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection OK");

    // 📧 Send notification to CTIS team
    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: email,
      to: ["info@ctistech.com", "support@ctistech.com"],
      subject: "New Contact Message",
      html: contactNotificationTemplate({ name, email, message, ip }),
    });

    // 📧 Auto‑reply to sender
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "We received your message",
      html: autoReplyTemplate(name, message),
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
