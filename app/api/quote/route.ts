import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { quoteTemplate } from "@/lib/email/quote-template";
import { quoteAutoReply } from "@/lib/email/quote-autoreply";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const quote = await db.quoteRequest.create({
      data: {
        name: body.name,
        email: body.email,
        organization: body.organization,
        details: body.details,
      },
    });

    // Send admin notification
    await sendMail({
      to: process.env.NOTIFY_EMAIL!,
      subject: "New Quote Request",
      html: quoteTemplate(body),
    });

    // Send auto-reply to user
    await sendMail({
      to: body.email,
      subject: "We Received Your Quote Request",
      html: quoteAutoReply(body.name),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
