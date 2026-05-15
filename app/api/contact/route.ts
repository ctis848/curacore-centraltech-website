export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const message = form.get("message") as string;
    const file = form.get("file") as File | null;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!apiKey || !notifyEmail) {
      console.error("Missing Brevo API environment variables");
      return NextResponse.json(
        { success: false, error: "Server email configuration error" },
        { status: 500 }
      );
    }

    // Optional attachment (Base64)
    let attachment: { name: string; content: string } | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      attachment = {
        name: file.name,
        content: buffer.toString("base64"),
      };
    }

    // Build email payload
    const payload: any = {
      sender: {
        name: "CentralCore Contact",
        email: notifyEmail,
      },
      to: [{ email: notifyEmail }],
      subject: "New Contact Form Message",
      htmlContent: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    if (attachment) {
      payload.attachment = [attachment];
    }

    // Send email via Brevo REST API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API Error:", errorText);

      return NextResponse.json(
        { success: false, error: "Brevo API failed", details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact API error:", err);

    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
