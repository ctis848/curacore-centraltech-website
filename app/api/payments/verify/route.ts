export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing reference" },
        { status: 400 }
      );
    }

    console.log("🔍 VERIFYING PAYMENT:", reference);

    // 1️⃣ VERIFY WITH PAYSTACK
    const verifyRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const raw = await verifyRes.text();
    console.log("🔥 RAW PAYSTACK RESPONSE:", raw);

    if (raw.startsWith("<")) {
      return NextResponse.json(
        { success: false, error: "Paystack returned HTML" },
        { status: 400 }
      );
    }

    const data = JSON.parse(raw);

    // ❗ DVA payments will return "Transaction not found"
    if (!data.status) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found. If this was a bank transfer, wait for webhook.",
        dva: true,
      });
    }

    const trx = data.data;

    if (trx.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment not successful" },
        { status: 400 }
      );
    }

    // 2️⃣ Extract metadata
    const meta = trx.metadata || {};
    const customerEmail = meta.email ?? trx.customer?.email ?? null;

    console.log("📦 METADATA:", meta);

    // 3️⃣ Return success — webhook handles DB + emails
    return NextResponse.json({
      success: true,
      email: customerEmail,
      amount: trx.amount / 100,
      reference,
      message: "Payment verified. Webhook will finalize processing.",
    });

  } catch (err) {
    console.error("🔥 VERIFY ROUTE ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
