import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // ----------------------------------------------------
    // VERIFY PAYMENT WITH PAYSTACK
    // ----------------------------------------------------
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }

    const metadata = verifyData.data.metadata;
    const amount = metadata.serviceAmount;
    const serviceName = metadata.serviceName;
    const userId = metadata.userId;

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // LOG PAYMENT (NO ERRORS)
    // ----------------------------------------------------
    await supabase.from("Payment").insert({
      userid: userId,
      amount,
      currency: "NGN",
      status: "success",
      reference,
      gateway: "paystack",
      purpose: `service: ${serviceName}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/client/service-payment?success=1`
    );
  } catch (err) {
    console.error("SERVICE VERIFY ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
