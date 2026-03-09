import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { contactTemplate } from "@/lib/email/contact-template";
import { contactAutoReply } from "@/lib/email/contact-autoreply";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.contactMessage.create({
      data: { name, email, message },
    });

    // Admin email
    await sendMail({
      to: process.env.NOTIFY_EMAIL!,
      subject: "New Contact Message",
      html: contactTemplate({ name, email, message }),
    });

    // Auto-reply
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
