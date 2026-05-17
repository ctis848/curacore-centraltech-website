export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET() {
  try {
    // 1. Check environment variables
    const envCheck = {
      paystackKeyLoaded: !!PAYSTACK_SECRET_KEY,
      paystackKeyStartsWith: PAYSTACK_SECRET_KEY?.substring(0, 8) || null,
      appUrl: APP_URL || null,
    };

    // If key missing, return immediately
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        step: "env",
        message: "PAYSTACK_SECRET_KEY is missing",
        envCheck,
      });
    }

    // 2. Try a Paystack test request
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        amount: 50000, // ₦500
        callback_url: `${APP_URL}/payment/callback`,
      }),
    });

    const raw = await response.text();

    // 3. Detect HTML response (means Paystack rejected your request)
    const isHTML = raw.trim().startsWith("<");

    if (isHTML) {
      return NextResponse.json({
        ok: false,
        step: "paystack",
        message: "Paystack returned HTML instead of JSON",
        reason: "Your secret key is invalid OR your server cannot reach Paystack",
        htmlSnippet: raw.substring(0, 200),
        envCheck,
      });
    }

    // 4. Parse JSON
    const data = JSON.parse(raw);

    return NextResponse.json({
      ok: true,
      step: "paystack",
      message: "Paystack responded correctly",
      envCheck,
      paystackResponse: data,
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: "server",
      message: "Server error occurred",
      error: err.message,
    });
  }
}
