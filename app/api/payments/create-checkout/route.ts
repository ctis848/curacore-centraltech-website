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

    console.log("🔥 CHECKOUT BODY RECEIVED:", JSON.stringify(body, null, 2));

    const email = String(body?.email || "").trim();
    const companyName = String(body?.companyName || "").trim();
    const plan = String(body?.plan || "").trim();
    const quantity = Number(body?.quantity || 0);
    const annualFee = Number(body?.annualFee || 0);
    const amount = Number(body?.amount || 0);
    const type = String(body?.type || "").trim();
    const couponCode = body?.couponCode || null;

    console.log("🔥 VALIDATION VALUES:", {
      email,
      companyName,
      plan,
      quantity,
      annualFee,
      amount,
      type,
      couponCode,
    });

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

    const metadata = {
      type,
      email,
      companyName,
      plan,
      quantity,
      annualFee,
      couponCode,
      description: "New License Purchase",
    };

    const reference = `CC-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    console.log("🔥 PAYSTACK PAYLOAD:", {
      email,
      amount: amount * 100,
      metadata,
      reference,
      callback_url: `${APP_URL}/payment/callback?reference=${reference}`,
    });

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
    console.log("🔥 RAW PAYSTACK RESPONSE:", raw);

    if (raw.startsWith("<")) {
      return NextResponse.json(
        { error: "Paystack returned HTML. Payload invalid." },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
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

    // ----------------------------------------------------
    // ⭐ SEND EMAIL NOTIFICATION TO CTIS TECH
    // ----------------------------------------------------
    await sendEmail({
      to: "info@ctistech.com",
      subject: "New License Purchase Request",
      html: `
        <h2>New License Request</h2>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Annual Fee:</strong> ₦${annualFee.toLocaleString()}</p>
        <p><strong>Amount to Pay:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Coupon Used:</strong> ${couponCode || "None"}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <br/>
        <p>This license request has been initialized on Paystack.</p>
      `,
    });

    // ----------------------------------------------------
    // RETURN PAYSTACK URL
    // ----------------------------------------------------
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
