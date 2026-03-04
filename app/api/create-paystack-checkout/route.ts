import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { email, amount, plan, user_id, fullName } = body;

    if (!email || !amount || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store pending payment
    await supabase.from("payments").insert({
      email,
      amount,
      plan,
      user_id,
      fullName,
      status: "pending",
    });

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100,
          metadata: { plan, user_id, fullName },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`,
        }),
      }
    );

    const data = await paystackRes.json();

    if (!data?.status || !data?.data?.authorization_url) {
      return NextResponse.json(
        { error: "Paystack initialization failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
    });
  } catch (error) {
    console.error("PAYSTACK ERROR:", error);
    return NextResponse.json(
      { error: "Server error initializing payment" },
      { status: 500 }
    );
  }
}
