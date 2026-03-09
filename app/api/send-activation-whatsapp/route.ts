import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { key, clientEmail } = await req.json();

  const payload = {
    messaging_product: "whatsapp",
    to: "2348012345678", // admin WhatsApp
    type: "text",
    text: {
      body: `New License Activation Request:

Client Email: ${clientEmail}
Request Key: ${key}

Please review in the Admin Dashboard.`
    }
  };

  await fetch(
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

  return NextResponse.json({ ok: true });
}
