export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🔥 LOG 1 — Raw body received
    console.log("🔥 CHECKOUT BODY RECEIVED:", JSON.stringify(body, null, 2));

    // -------------------------------
    // Extract fields safely
    // -------------------------------
    const email = String(body?.email || "").trim();
    const companyName = String(body?.companyName || "").trim();
    const plan = String(body?.plan || "").trim();
    const quantity = Number(body?.quantity || 0);
    const annualFee = Number(body?.annualFee || 0);
    const amount = Number(body?.amount || 0);
    const type = String(body?.type || "").trim();

    // 🔥 LOG 2 — Validation values
    console.log("🔥 VALIDATION VALUES:", {
      email,
      companyName,
      plan,
      quantity,
      annualFee,
      amount,
      type,
    });

    // -------------------------------
    // Validate required fields
    // -------------------------------
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Valid quantity is required" }, { status: 400 });
    }

    if (!annualFee || isNaN(annualFee) || annualFee <= 0) {
      return NextResponse.json({ error: "Valid annual fee is required" }, { status: 400 });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Payment type is required" }, { status: 400 });
    }

    // -------------------------------
    // Prepare metadata
    // -------------------------------
    const metadata = {
      type,
      email,
      companyName,
      plan,
      quantity,
      annualFee,
      description: "New License Purchase",
    };

    // -------------------------------
    // Generate reference
    // -------------------------------
    const reference = `CC-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // 🔥 LOG 3 — Paystack payload
    console.log("🔥 PAYSTACK PAYLOAD:", {
      email,
      amount: amount * 100,
      metadata,
      reference,
      callback_url: `${APP_URL}/payment/callback?reference=${reference}`,
    });

    // -------------------------------
    // Initialize Paystack
    // -------------------------------
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: "NGN",
        reference,
        metadata,
        callback_url: `${APP_URL}/payment/callback?reference=${reference}`,
      }),
    });

    const raw = await response.text();

    // 🔥 LOG 4 — Raw Paystack response
    console.log("🔥 RAW PAYSTACK RESPONSE:", raw);

    // -------------------------------
    // Detect HTML response (Paystack error)
    // -------------------------------
    if (raw.startsWith("<")) {
      return NextResponse.json(
        { error: "Paystack returned HTML. Payload invalid." },
        { status: 400 }
      );
    }

    // -------------------------------
    // Parse JSON safely
    // -------------------------------
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return NextResponse.json(
        { error: "Paystack returned invalid JSON" },
        { status: 400 }
      );
    }

    // -------------------------------
    // Paystack rejected the request
    // -------------------------------
    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Paystack rejected the request" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
    });

  } catch (error) {
    console.error("🔥 SERVER CRASH:", error);
    return NextResponse.json(
      { error: "Something went wrong initializing payment" },
      { status: 500 }
    );
  }
}
