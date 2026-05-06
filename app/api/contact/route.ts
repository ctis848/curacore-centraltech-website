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
    console.log("🔥 Contact API hit");

    // Parse JSON safely
    let body: any = null;
    try {
      body = await req.json();
    } catch (err: any) {
      console.error("❌ JSON parse error:", err);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { name, email, message, honeypot, timestamp } = body;

    // Honeypot
    if (honeypot && honeypot.trim() !== "") {
      console.log("🛑 Honeypot triggered");
      return NextResponse.json({ success: true });
    }

    // Timestamp spam protection
    if (!timestamp || timestamp < 1500) {
      return NextResponse.json(
        { error: "Form submitted too quickly" },
        { status: 400 }
      );
    }

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Rate limit
    try {
      if (!rateLimit(ip as string, 5, 60_000)) {
        return NextResponse.json(
          { error: "Too many requests. Try again later." },
          { status: 429 }
        );
      }
    } catch (err: any) {
      console.error("❌ Rate limit error:", err);
      return NextResponse.json(
        { error: "Rate limit failure: " + err.message },
        { status: 500 }
      );
    }

    // Save to Supabase
    try {
      const { error: dbError } = await supabaseAdmin
        .from("contact_messages")
        .insert({
          name,
          email,
          message,
          ip_address: ip,
        });

      if (dbError) {
        console.error("❌ Supabase error:", dbError);
        return NextResponse.json(
          { error: "Database error: " + dbError.message },
          { status: 500 }
        );
      }
    } catch (err: any) {
      console.error("❌ Supabase crash:", err);
      return NextResponse.json(
        { error: "Supabase failure: " + err.message },
        { status: 500 }
      );
    }

    // Validate SMTP ENV
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      return NextResponse.json(
        { error: "SMTP environment variables missing" },
        { status: 500 }
      );
    }

    // Create transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });
    } catch (err: any) {
      console.error("❌ Transporter creation error:", err);
      return NextResponse.json(
        { error: "SMTP transporter failed: " + err.message },
        { status: 500 }
      );
    }

    // Verify SMTP
    try {
      await transporter.verify();
    } catch (err: any) {
      console.error("❌ SMTP verify error:", err);
      return NextResponse.json(
        { error: "SMTP verification failed: " + err.message },
        { status: 500 }
      );
    }

    // Send admin email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        replyTo: email,
        to: ["info@ctistech.com", "support@ctistech.com"],
        subject: "New Contact Message",
        html: contactNotificationTemplate({ name, email, message, ip }),
      });
    } catch (err: any) {
      console.error("❌ Admin email error:", err);
      return NextResponse.json(
        { error: "Failed to send admin email: " + err.message },
        { status: 500 }
      );
    }

    // Send auto‑reply
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "We received your message",
        html: autoReplyTemplate(name, message),
      });
    } catch (err: any) {
      console.error("❌ Auto‑reply error:", err);
      return NextResponse.json(
        { error: "Failed to send auto‑reply: " + err.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ UNCAUGHT ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
