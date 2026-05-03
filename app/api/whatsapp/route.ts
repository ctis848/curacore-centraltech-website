import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // ⭐ Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⭐ Validate WhatsApp credentials
    if (
      !process.env.WHATSAPP_TOKEN ||
      !process.env.WHATSAPP_NUMBER_ID ||
      !process.env.ADMIN_WHATSAPP
    ) {
      console.warn("WhatsApp alert not sent — missing environment variables");
      return NextResponse.json(
        { ok: false, error: "WhatsApp configuration missing" },
        { status: 500 }
      );
    }

    // ⭐ WhatsApp payload
    const payload = {
      messaging_product: "whatsapp",
      to: process.env.ADMIN_WHATSAPP, // e.g. "2349120523832"
      type: "text",
      text: {
        body: `📩 NEW WEBSITE MESSAGE

Name: ${name}
Email: ${email}
Message: ${message}

Sent from CentralCore Website.`,
      },
    };

    // ⭐ Send WhatsApp message
    const whatsappRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await whatsappRes.json();

    // ⭐ Handle WhatsApp API errors
    if (!whatsappRes.ok) {
      console.error("WhatsApp API Error:", result);
      return NextResponse.json(
        { ok: false, error: "Failed to send WhatsApp alert", details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "WhatsApp alert sent" });
  } catch (error) {
    console.error("WhatsApp Alert Error:", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
