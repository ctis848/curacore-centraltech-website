// FILE: app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { name, email, message, honeypot } = await req.json();

    // 🛑 Honeypot spam trap
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // 🛑 Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🛑 Rate limit: 1 message per minute per IP
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

    const { data: recent } = await supabaseAdmin
      .from("contact_messages")
      .select("id")
      .gte("created_at", oneMinuteAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    // ✅ Store message in DB
    const { error: insertError } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        ip_address: ip,
      });

    if (insertError) {
      console.error("DB insert error (contact_messages):", insertError);
    }

    // 📧 GoDaddy cPanel SMTP transporter (SSL required)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.secureserver.net
      port: Number(process.env.SMTP_PORT), // 465
      secure: true, // SSL required for GoDaddy cPanel
      auth: {
        user: process.env.SMTP_USER, // info@ctistech.com
        pass: process.env.SMTP_PASS, // email password
      },
    });

    // 📧 Send to CTIS team
    await transporter.sendMail({
      from: process.env.SMTP_FROM, // CTIS <info@ctistech.com>
      replyTo: email,
      to: ["info@ctistech.com", "support@ctistech.com"],
      subject: "New Contact Message",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>IP:</strong> ${ip}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // 📧 Confirmation email to sender
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "We received your message",
      html: `
        <h2>Thank you for contacting CTIS</h2>
        <p>Hello ${name},</p>
        <p>We have received your message and our team will get back to you shortly.</p>
        <hr />
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
      `,
    });

    // 📝 Admin notification log
    await supabaseAdmin.from("activity_logs").insert({
      admin_id: null,
      action: "contact_message_received",
      details: {
        name,
        email,
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
