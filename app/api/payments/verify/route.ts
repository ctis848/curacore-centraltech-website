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

    // ----------------------------------------------------
    // 1️⃣ VERIFY WITH PAYSTACK
    // ----------------------------------------------------
    const verifyRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const raw = await verifyRes.text();

    // Paystack sometimes returns HTML when rate‑limited
    if (raw.startsWith("<")) {
      return NextResponse.json(
        {
          success: false,
          error: "Paystack returned HTML instead of JSON",
          dva: false,
        },
        { status: 400 }
      );
    }

    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON PARSE ERROR:", err);
      return NextResponse.json(
        { success: false, error: "Invalid Paystack response" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 2️⃣ HANDLE DVA (BANK TRANSFER) CASE
    // ----------------------------------------------------
    if (!data.status) {
      return NextResponse.json({
        success: false,
        dva: true,
        error:
          "Transaction not found. If this was a bank transfer, wait for webhook.",
      });
    }

    const trx = data.data;

    // ----------------------------------------------------
    // 3️⃣ PAYMENT NOT SUCCESSFUL
    // ----------------------------------------------------
    if (trx.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          status: trx.status,
          error: "Payment not successful",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 4️⃣ EXTRACT METADATA
    // ----------------------------------------------------
    const meta = trx.metadata || {};

    const customerEmail =
      meta.email ??
      meta.customerEmail ??
      trx.customer?.email ??
      null;

    const paymentType = meta.type ?? null;
    const plan = meta.plan ?? null;
    const quantity = meta.quantity ?? null;
    const companyName = meta.companyName ?? null;

    console.log("📦 METADATA:", meta);

    // ----------------------------------------------------
    // 5️⃣ CHECK IF WEBHOOK HAS ALREADY PROCESSED THIS PAYMENT
    // ----------------------------------------------------
    const supabase = supabaseServer();

    const { data: existingPayment } = await supabase
      .from("Payment")
      .select("id, status")
      .eq("reference", reference)
      .maybeSingle();

    const webhookProcessed = !!existingPayment;

    // ----------------------------------------------------
    // 6️⃣ RETURN UNIFIED RESPONSE FOR FRONTEND
    // ----------------------------------------------------
    return NextResponse.json({
      success: true,
      status: "success",
      reference,
      amount: trx.amount / 100,
      email: customerEmail,
      paymentType,
      plan,
      quantity,
      companyName,
      webhookProcessed,
      message: webhookProcessed
        ? "Payment verified and already processed by webhook."
        : "Payment verified. Webhook will finalize processing.",
    });
  } catch (err) {
    console.error("🔥 VERIFY ROUTE ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
