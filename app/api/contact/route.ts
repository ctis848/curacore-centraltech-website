import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import {
  contactNotificationTemplate,
  autoReplyTemplate,
} from "@/lib/emailTemplates";

function json(payload: any, status = 200) {
  return new NextResponse(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    console.log("🔥 Contact API hit");

    // -----------------------------
    // 1. SAFE JSON PARSE
    // -----------------------------
    let body: any = null;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : null;
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return json({ error: "Invalid JSON body" }, 400);
    }

    if (!body) {
      return json({ error: "Empty request body" }, 400);
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { name, email, message, honeypot, timestamp } = body;

    // -----------------------------
    // 2. HONEYPOT
    // -----------------------------
    if (honeypot && honeypot.trim() !== "") {
      console.log("🛑 Honeypot triggered");
      return json({ success: true });
    }

    // -----------------------------
    // 3. TIMESTAMP SPAM PROTECTION
    // -----------------------------
    const now = Date.now();
    if (!timestamp || now - timestamp < 1500) {
      return json({ error: "Form submitted too quickly" }, 400);
    }

    // -----------------------------
    // 4. VALIDATION
    // -----------------------------
    if (!name || !email || !message) {
      return json({ error: "All fields are required" }, 400);
    }

    // -----------------------------
    // 5. RATE LIMIT
    // -----------------------------
    try {
      if (!rateLimit(ip as string, 5, 60_000)) {
        return json(
          { error: "Too many requests. Try again later." },
          429
        );
      }
    } catch (err: any) {
      console.error("❌ Rate limit error:", err);
      return json(
        { error: "Rate limit failure: " + err.message },
        500
      );
    }

    // -----------------------------
    // 6. SAVE TO SUPABASE
    // -----------------------------
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
        return json(
          { error: "Database error: " + dbError.message },
          500
        );
      }
    } catch (err: any) {
      console.error("❌ Supabase crash:", err);
      return json(
        { error: "Supabase failure: " + err.message },
        500
      );
    }

    // -----------------------------
    // 7. SEND ADMIN EMAIL (BREVO)
    // -----------------------------
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

    let adminErrorText = "";
    try {
      adminErrorText = await adminRes.text();
    } catch {}

    if (!adminRes.ok) {
      console.error("❌ Brevo admin email error:", adminErrorText || "No error text");
      return json(
        { error: adminErrorText || "Failed to send admin email" },
        500
      );
    }

    // -----------------------------
    // 8. SEND AUTO‑REPLY (BREVO)
    // -----------------------------
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

    let autoErrorText = "";
    try {
      autoErrorText = await autoRes.text();
    } catch {}

    if (!autoRes.ok) {
      console.error("❌ Brevo auto-reply error:", autoErrorText || "No error text");
      return json(
        { error: autoErrorText || "Failed to send auto-reply" },
        500
      );
    }

    // -----------------------------
    // 9. SUCCESS
    // -----------------------------
    return json({ success: true });

  } catch (err: any) {
    console.error("❌ UNCAUGHT ERROR:", err);
    return json(
      { error: err?.message || "Unknown server error" },
      500
    );
  }
}
