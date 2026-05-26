import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await verifyRes.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ status: "failed" });
    }

    const invoiceId = data.data.reference.split("-")[1]; // CTIS-{id}-{timestamp}

    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update invoice status
    await supabase
      .from("ServiceRequests")
      .update({
        status: "paid",
        payment_reference: reference,
        payment_date: new Date().toISOString()
      })
      .eq("id", invoiceId);

    return NextResponse.json({ status: "success", invoiceId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
