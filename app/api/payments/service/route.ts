import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceName, amount } = body;

    if (!serviceName || !amount) {
      return NextResponse.json(
        { error: "Missing serviceName or amount" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // AUTHENTICATED USER
    // ----------------------------------------------------
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User email required for Paystack checkout" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // INITIALIZE PAYSTACK PAYMENT
    // ----------------------------------------------------
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amount * 100, // Paystack uses kobo
          metadata: {
            type: "SERVICE_PAYMENT",
            userId: user.id,
            serviceName,
            serviceAmount: amount,
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/service/verify`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData?.status || !paystackData?.data?.authorization_url) {
      console.error("Paystack error:", paystackData);
      return NextResponse.json(
        { error: "Failed to initialize Paystack transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: paystackData.data.authorization_url,
      amount,
      serviceName,
    });
  } catch (err) {
    console.error("SERVICE PAYMENT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
