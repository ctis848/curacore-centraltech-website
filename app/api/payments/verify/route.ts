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

    // -------------------------------
    // 1️⃣ CHECK LOCAL DATABASE FIRST
    // -------------------------------
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (payment && payment.status === "success") {
      return NextResponse.json(
        {
          success: true,
          status: "success",
          reference,
          amount: payment.amount,
          paidAt: payment.created_at,
          message: "Payment verified successfully (database).",
        },
        { status: 200 }
      );
    }

    // -------------------------------
    // 2️⃣ VERIFY DIRECTLY WITH PAYSTACK
    // -------------------------------
    const paystackRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = await paystackRes.text();
    const trimmed = raw.trim();

    if (trimmed.startsWith("<")) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: "Paystack returned HTML. Try again.",
        },
        { status: 500 }
      );
    }

    let paystackData;
    try {
      paystackData = JSON.parse(trimmed);
    } catch {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: "Invalid Paystack JSON response",
        },
        { status: 500 }
      );
    }

    if (!paystackData?.status || !paystackData?.data) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: "Unable to verify payment with Paystack",
        },
        { status: 200 }
      );
    }

    const tx = paystackData.data;
    const txStatus = String(tx.status || "").toLowerCase();

    console.log("📡 PAYSTACK STATUS:", txStatus);

    // -------------------------------
    // 3️⃣ HANDLE SUCCESSFUL PAYMENT
    // -------------------------------
    if (txStatus === "success") {
      const paidAmount = tx.amount / 100;
      const paidAt = tx.paid_at || new Date().toISOString();
      const email = tx.customer?.email;
      const metadata = tx.metadata || {};

      // Find client
      let clientId = null;

      if (email) {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (client) clientId = client.id;
      }

      // Save payment
      await supabase.from("payments").upsert(
        {
          reference,
          client_id: clientId,
          email,
          amount: paidAmount,
          status: "success",
          gateway: "paystack",
          channel: tx.channel,
          metadata,
          created_at: paidAt,
        },
        { onConflict: "reference" }
      );

      // Save invoice (if not already created by webhook)
      await supabase.from("invoices").upsert(
        {
          reference,
          client_id: clientId,
          email,
          company_name: metadata.companyName ?? "",
          plan: metadata.plan ?? "",
          quantity: metadata.quantity ?? 1,
          amount: paidAmount,
          created_at: paidAt,
        },
        { onConflict: "reference" }
      );

      return NextResponse.json(
        {
          success: true,
          status: "success",
          reference,
          amount: paidAmount,
          paidAt,
          message: "Payment verified successfully (Paystack).",
        },
        { status: 200 }
      );
    }

    // -------------------------------
    // 4️⃣ HANDLE PENDING PAYMENT
    // -------------------------------
    if (["pending", "processing"].includes(txStatus)) {
      return NextResponse.json(
        {
          success: true,
          status: "pending",
          message: "Payment is still pending on Paystack.",
        },
        { status: 200 }
      );
    }

    // -------------------------------
    // 5️⃣ FAILED / ABANDONED / REVERSED
    // -------------------------------
    return NextResponse.json(
      {
        success: true,
        status: "failed",
        message: `Payment not successful. Status: ${txStatus}`,
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
