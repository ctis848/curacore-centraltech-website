// app/api/payments/create-checkout/route.ts
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const { amount, email, planName, quantity = 1 } = await request.json();

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!amount || !email) {
      return NextResponse.json(
        { error: "amount and email are required" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack expects kobo
        email,
        metadata: {
          plan: planName,
          quantity: quantity.toString(),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize Paystack transaction" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error) {
    console.error("Paystack error:", error);
    return NextResponse.json(
      { error: "Something went wrong initializing payment" },
      { status: 500 }
    );
  }
}
