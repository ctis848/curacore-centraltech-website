import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { status: "failed", message: "Missing transaction reference" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await verifyRes.json();

    // Paystack verification failed
    if (!data?.status || data?.data?.status !== "success") {
      return NextResponse.json(
        {
          status: "failed",
          message: "Payment verification failed",
          details: data,
        },
        { status: 400 }
      );
    }

    // Payment successful
    return NextResponse.json({
      status: "success",
      reference,
      amount: data.data.amount / 100,
      email: data.data.customer.email,
      plan: data.data.metadata?.plan,
      user_id: data.data.metadata?.user_id,
    });
  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error);
    return NextResponse.json(
      { status: "failed", message: "Server error verifying payment" },
      { status: 500 }
    );
  }
}
