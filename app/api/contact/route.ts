import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { contactTemplate } from "@/lib/email/contact-template";
import { contactAutoReply } from "@/lib/email/contact-autoreply";

export async function POST(req: Request) {
  try {
    // --- SAFETY GUARDS (Prevents Netlify build crashes) ---
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing — skipping DB write.");
      return NextResponse.json(
        { error: "Server misconfigured: DATABASE_URL missing" },
        { status: 500 }
      );
    }

    if (!process.env.NOTIFY_EMAIL) {
      console.error("NOTIFY_EMAIL is missing — cannot send admin email.");
      return NextResponse.json(
        { error: "Server misconfigured: NOTIFY_EMAIL missing" },
        { status: 500 }
      );
    }

    // --- Parse request body ---
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // --- Save to DB ---
    await db.contactMessage.create({
      data: { name, email, message },
    });

    // --- Admin notification ---
    await sendMail({
      to: process.env.NOTIFY_EMAIL,
      subject: "New Contact Message",
      html: contactTemplate({ name, email, message }),
    });

    // --- Auto-reply to user ---
    await sendMail({
      to: email,
      subject: "We Received Your Message",
      html: contactAutoReply(name),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
