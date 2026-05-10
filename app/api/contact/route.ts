import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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

    // ⭐ BREVO REST API — ADMIN EMAIL
    const adminPayload = {
      sender: { name: "CTIS Tech", email: "no-reply@ctistech.com" },
      to: [{ email: "info@ctistech.com" }],
      replyTo: { email },
      subject: "New Contact Message",
      htmlContent: contactNotificationTemplate({
        name,
        email,
        message,
        ip,
      }),
    };

    const adminRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify(adminPayload),
    });

    if (!adminRes.ok) {
      console.error("❌ Brevo admin email error:", await adminRes.text());
      return NextResponse.json(
        { error: "Failed to send admin email" },
        { status: 500 }
      );
    }

    // ⭐ BREVO REST API — AUTO‑REPLY
    const autoReplyPayload = {
      sender: { name: "CTIS Tech", email: "no-reply@ctistech.com" },
      to: [{ email }],
      replyTo: { email: "info@ctistech.com" },
      subject: "We received your message",
      htmlContent: autoReplyTemplate(name, message),
    };

    const autoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify(autoReplyPayload),
    });

    if (!autoRes.ok) {
      console.error("❌ Brevo auto-reply error:", await autoRes.text());
      return NextResponse.json(
        { error: "Failed to send auto-reply" },
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
