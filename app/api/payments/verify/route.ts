export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Keeping your original constants for format consistency
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

    // ----------------------------------------------------
    // 1️⃣ CHECK SUPABASE (WEBHOOK RESULT)
    // ----------------------------------------------------
    const supabase = supabaseServer();

    const { data: payment, error } = await supabase
      .from("payments") // correct table
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

    // ----------------------------------------------------
    // 2️⃣ PAYMENT NOT FOUND → WEBHOOK STILL PROCESSING
    // ----------------------------------------------------
    if (!payment) {
      return NextResponse.json(
        {
          success: true,
          status: "pending",
          message: "Payment not found yet. Webhook may still be processing.",
        },
        { status: 200 }
      );
    }

    // ----------------------------------------------------
    // 3️⃣ PAYMENT FOUND BUT NOT SUCCESSFUL
    // ----------------------------------------------------
    if (payment.status !== "success") {
      return NextResponse.json(
        {
          success: true,
          status: "failed",
          message: "Payment exists but is not marked successful.",
        },
        { status: 200 }
      );
    }

    // ----------------------------------------------------
    // 4️⃣ PAYMENT SUCCESSFUL
    // ----------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        status: "success",
        reference: payment.reference,
        amount: payment.amount,
        paidAt: payment.created_at,
        message: "Payment verified successfully.",
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
