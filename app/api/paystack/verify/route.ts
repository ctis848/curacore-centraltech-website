export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    // ----------------------------------------------------
    // 1️⃣ VERIFY WITH PAYSTACK
    // ----------------------------------------------------
    const verifyRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = await verifyRes.text();
    const trimmed = raw.trim();

    // Paystack sometimes returns HTML when rate-limited
    if (trimmed.startsWith("<")) {
      return NextResponse.json(
        { success: false, status: "failed", error: "Paystack returned HTML" },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return NextResponse.json(
        { success: false, status: "failed", error: "Invalid Paystack JSON" },
        { status: 500 }
      );
    }

    if (!data?.status || !data?.data) {
      return NextResponse.json(
        { success: false, status: "failed", error: "Unable to verify payment" },
        { status: 200 }
      );
    }

    const tx = data.data;
    const txStatus = String(tx.status).toLowerCase();

    // ----------------------------------------------------
    // 2️⃣ HANDLE FAILED / PENDING
    // ----------------------------------------------------
    if (txStatus !== "success") {
      return NextResponse.json(
        { success: true, status: txStatus },
        { status: 200 }
      );
    }

    // ----------------------------------------------------
    // 3️⃣ EXTRACT INVOICE ID FROM REFERENCE
    // Format: INV-<invoiceId>-<timestamp>
    // ----------------------------------------------------
    const parts = reference.split("-");
    const invoiceId = parts.length >= 3 ? parts[1] : null;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, status: "failed", error: "Invalid reference format" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 4️⃣ UPDATE INVOICE AS PAID
    // ----------------------------------------------------
    const { error: updateErr } = await supabaseAdmin
      .from("invoices")
      .update({
        status: "PAID",
        payment_reference: reference,
        payment_date: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateErr) {
      console.error("Invoice update error:", updateErr);
      return NextResponse.json(
        { success: false, status: "failed", error: "Failed to update invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "success",
        invoiceId,
        reference,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
