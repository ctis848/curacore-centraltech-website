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
      console.log("Honeypot triggered — bot blocked.");
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

    console.log("📨 New contact submission:", {
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

    // 🧪 Validate SMTP ENV
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      console.error("❌ Missing SMTP environment variables");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    console.log("🔐 SMTP USER:", process.env.SMTP_USER);
    console.log("🔐 SMTP PASS:", process.env.SMTP_PASS.slice(0, 10) + "...");

    // 📧 Brevo SMTP Transporter (same as test route)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 🧪 Verify transporter
    await transporter.verify();
    console.log("✅ SMTP Verified");

    // 📧 Email to CTIS team
    const adminEmail = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      replyTo: email,
      to: ["info@ctistech.com", "support@ctistech.com"],
      subject: "New Contact Message",
      html: contactNotificationTemplate({ name, email, message, ip }),
    });

    console.log("📤 Admin email sent:", adminEmail.messageId);

    // 📧 Auto‑reply to sender
    const autoReply = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "We received your message",
      html: autoReplyTemplate(name, message),
    });

    console.log("📤 Auto‑reply sent:", autoReply.messageId);

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
