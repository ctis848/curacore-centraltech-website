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
        { success: false, status: "failed", error: "Missing reference" },
        { status: 400 }
      );
    }

    console.log("🔍 VERIFYING PAYMENT:", reference);

    const supabase = supabaseServer();

    // 1️⃣ Check local payments table first
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (error) {
      console.error("❌ DB ERROR:", error);
      return NextResponse.json(
        { success: false, status: "failed", error: "Database error" },
        { status: 500 }
      );
    }

    // 2️⃣ If found and marked success → trust DB
    if (payment && String(payment.status).toLowerCase() === "success") {
      return NextResponse.json(
        {
          success: true,
          status: "success",
          reference: payment.reference,
          amount: payment.amount,
          paidAt: payment.created_at,
          message: "Payment verified successfully (from database).",
        },
        { status: 200 }
      );
    }

    // 3️⃣ If not found or not success → confirm with Paystack directly
    const paystackRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();
    console.log("📡 PAYSTACK VERIFY RESPONSE:", paystackData);

    // If Paystack call itself failed
    if (!paystackData?.status) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: "Unable to verify payment with Paystack.",
        },
        { status: 200 }
      );
    }

    const tx = paystackData.data;

    // Normalize Paystack status
    const txStatus = String(tx?.status || "").toLowerCase();

    if (txStatus === "success") {
      // 4️⃣ Optionally upsert into payments table to keep in sync
      if (!payment) {
        const { error: upsertError } = await supabase.from("payments").insert({
          reference,
          amount: tx.amount / 100,
          status: "success",
          gateway: "paystack",
          channel: tx.channel,
          created_at: tx.paid_at || new Date().toISOString(),
        });

        if (upsertError) {
          console.error("❌ UPSERT ERROR:", upsertError);
        }
      }

      return NextResponse.json(
        {
          success: true,
          status: "success",
          reference,
          amount: tx.amount / 100,
          paidAt: tx.paid_at || new Date().toISOString(),
          message: "Payment verified successfully (from Paystack).",
        },
        { status: 200 }
      );
    }

    if (txStatus === "pending" || txStatus === "processing") {
      return NextResponse.json(
        {
          success: true,
          status: "pending",
          message: "Payment is still pending on Paystack.",
        },
        { status: 200 }
      );
    }

    // Any other status → failed
    return NextResponse.json(
      {
        success: true,
        status: "failed",
        message: `Payment not successful. Current status: ${txStatus}`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("🔥 VERIFY ROUTE ERROR:", err);
    return NextResponse.json(
      { success: false, status: "failed", error: "Verification failed" },
      { status: 500 }
    );
  }
}
