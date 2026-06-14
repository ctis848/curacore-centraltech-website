export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(req: Request) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "PAYSTACK_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    if (!BASE_URL) {
      return NextResponse.json(
        { success: false, error: "NEXT_PUBLIC_APP_URL missing" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("id");

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "Missing invoice ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // 1️⃣ FETCH INVOICE FROM DATABASE
    // ----------------------------------------------------
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { success: false, error: "Invoice already paid" },
        { status: 400 }
      );
    }

    const amount = Number(invoice.amount);
    const email = invoice.company_email || invoice.email;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Invoice email missing" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 2️⃣ PREPARE PAYSTACK PAYLOAD
    // ----------------------------------------------------
    const reference = `INV-${invoiceId}-${Date.now()}`;

    const payload = {
      email,
      amount: amount * 100, // convert to kobo
      currency: "NGN",
      reference,
      metadata: {
        type: "INVOICE_PAYMENT",
        invoiceId,
        companyName: invoice.company_name,
        planName: invoice.plan_name,
        description: "Invoice Payment",
      },
      callback_url: `${BASE_URL}/payments/status?reference=${reference}`,
    };

    // ----------------------------------------------------
    // 3️⃣ INITIALIZE PAYSTACK TRANSACTION
    // ----------------------------------------------------
    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await paystackRes.text();
    const trimmed = raw.trim();

    if (trimmed.startsWith("<")) {
      return NextResponse.json(
        { success: false, error: "Paystack returned HTML. Try again." },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid Paystack JSON response" },
        { status: 400 }
      );
    }

    if (!data.status) {
      return NextResponse.json(
        { success: false, error: data.message || "Paystack error" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 4️⃣ RETURN AUTHORIZATION URL
    // ----------------------------------------------------
    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (err: any) {
    console.error("🔥 INITIATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
