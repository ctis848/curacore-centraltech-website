export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await verifyRes.json();

    if (!data.status) {
      return NextResponse.json({ status: "failed" }, { status: 200 });
    }

    if (data.data.status !== "success") {
      return NextResponse.json({ status: data.data.status }, { status: 200 });
    }

    // Extract invoice ID
    const parts = reference.split("-");
    const invoiceId = parts.length >= 3 ? parts[1] : null;

    if (!invoiceId) {
      return NextResponse.json(
        { status: "failed", error: "Invalid reference format" },
        { status: 400 }
      );
    }

    // Update invoice
    await supabaseAdmin
      .from("ServiceRequests")
      .update({
        status: "paid",
        payment_reference: reference,
        payment_date: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    return NextResponse.json({ status: "success", invoiceId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
