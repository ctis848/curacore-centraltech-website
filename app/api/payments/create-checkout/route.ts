export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    if (!APP_URL) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is missing" },
        { status: 500 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const email = String(body?.email || "").trim();
    const companyName = String(body?.companyName || "").trim();
    const plan = String(body?.plan || "").trim();
    const quantity = Number(body?.quantity || 0);
    const annualFee = Number(body?.annualFee || 0);
    const amount = Number(body?.amount || 0);
    const type = String(body?.type || "").trim();
    const couponCode = body?.couponCode || null;

    // -------------------------------
    // VALIDATION
    // -------------------------------
    if (!email || !email.includes("@"))
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );

    if (!companyName)
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );

    if (!plan)
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );

    if (!quantity || quantity <= 0)
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );

    if (!annualFee || annualFee <= 0)
      return NextResponse.json(
        { error: "Valid annual fee is required" },
        { status: 400 }
      );

    if (!amount || amount <= 0)
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );

    if (!type)
      return NextResponse.json(
        { error: "Payment type is required" },
        { status: 400 }
      );

    // -------------------------------
    // METADATA (Webhook + Admin Dashboard)
    // -------------------------------
    const metadata = {
      type,
      email,
      companyName,
      plan,
      quantity,
      annualFee,
      couponCode,
      description: "New License Purchase",
      custom_fields: [
        {
          display_name: "Company",
          variable_name: "company_name",
          value: companyName,
        },
      ],
    };

    // -------------------------------
    // Generate reference
    // -------------------------------
    const reference = `CC-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;

    // -------------------------------
    // PAYSTACK PAYLOAD
    // -------------------------------
    const paystackPayload = {
      email,
      amount: amount * 100,
      currency: "NGN",
      reference,
      metadata,

      // ⭐ Unified callback page
      callback_url: `${APP_URL}/payment/status?reference=${reference}`,

      // ⭐ VALID CHANNELS (CARD + BANK + TRANSFER + USSD + QR)
      channels: ["card", "bank", "bank_transfer", "ussd", "qr"],
    };

    // -------------------------------
    // Initialize Paystack
    // -------------------------------
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const raw = await response.text();

    // Paystack sometimes returns HTML when rate-limited
    if (raw.startsWith("<")) {
      return NextResponse.json(
        { error: "Paystack returned HTML. Invalid payload." },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Paystack returned invalid JSON" },
        { status: 400 }
      );
    }

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Paystack rejected the request" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("🔥 SERVER CRASH:", error);
    return NextResponse.json(
      { error: "Something went wrong initializing payment" },
      { status: 500 }
    );
  }
}
