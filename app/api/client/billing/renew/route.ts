import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1. Load client billing record
    const { data: billing, error: billingError } = await supabase
      .from("ClientBilling")
      .select("annual_fee, next_renewal_date")
      .eq("userId", userId)
      .single();

    if (billingError || !billing) {
      return NextResponse.json(
        { success: false, error: "Billing record not found" },
        { status: 404 }
      );
    }

    const annualFee = billing.annual_fee;

    // 2. Create Paystack checkout
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: annualFee,
        type: "ANNUAL_RENEWAL",
        userId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.authorization_url) {
      return NextResponse.json(
        { success: false, error: data.error || "Unable to start payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.authorization_url,
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
