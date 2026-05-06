import { NextResponse } from "next/server";
import axios from "axios";
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

    // Validate Brevo API key
    if (!process.env.BREVO_API_KEY || !process.env.SMTP_FROM) {
      return NextResponse.json(
        { error: "Brevo API environment variables missing" },
        { status: 500 }
      );
    }

    // Send admin email using Brevo API
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { email: process.env.SMTP_FROM },
          to: [
            { email: "info@ctistech.com" },
            { email: "support@ctistech.com" }
          ],
          subject: "New Contact Message",
          htmlContent: contactNotificationTemplate({ name, email, message, ip }),
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY!,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err: any) {
      console.error("❌ Brevo admin email error:", err);
      return NextResponse.json(
        { error: "Failed to send admin email: " + err.message },
        { status: 500 }
      );
    }

    // Send auto‑reply
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { email: process.env.SMTP_FROM },
          to: [{ email }],
          subject: "We received your message",
          htmlContent: autoReplyTemplate(name, message),
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY!,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err: any) {
      console.error("❌ Brevo auto‑reply error:", err);
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
