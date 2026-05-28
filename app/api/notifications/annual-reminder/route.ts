export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getRenewalEmailHtml } from "@/lib/email/renewalTemplates";

export async function POST(req: Request) {
  try {
    const {
      companyName,
      companyEmail,
      contactName,
      dueDate,
      planName,
      amountDue,
      paymentLink,
      type, // "30days" | "7days" | "3days" | "1day" | "today" | "overdue"
    } = await req.json();

    // 1️⃣ Validate required fields
    if (
      !companyEmail ||
      !companyName ||
      !dueDate ||
      !amountDue ||
      !paymentLink ||
      !type
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2️⃣ Load environment variables
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!apiKey || !notifyEmail) {
      return NextResponse.json(
        { success: false, error: "Missing Brevo API credentials" },
        { status: 500 }
      );
    }

    // 3️⃣ Generate full HTML + subject using your advanced template
    const { subject, html } = getRenewalEmailHtml({
      clientName: contactName || companyName,
      paymentLink,
      type,
    });

    // 4️⃣ Build Brevo payload
    const payload = {
      sender: { name: "CentralCore EMR", email: notifyEmail },
      to: [{ email: companyEmail }],
      cc: [{ email: notifyEmail }],
      subject,
      htmlContent: html,
    };

    // 5️⃣ Send email via Brevo
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
      return NextResponse.json(
        { success: false, error: "Brevo API failed", details: errorText },
        { status: 500 }
      );
    }

    // 6️⃣ Success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
