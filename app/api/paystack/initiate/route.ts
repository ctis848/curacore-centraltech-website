import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    // TODO: Fetch invoice amount from Supabase
    // IMPORTANT: amount MUST be in NAIRA here (e.g., 50000 = ₦50,000)
    const amount = 50000; // ₦50,000

    // Convert NAIRA → KOBO (Paystack requires kobo)
    const amountInKobo = amount * 100;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "customer@example.com", // TODO: Replace with real email
        amount: amountInKobo,          // CORRECT: send kobo
        reference: `CTIS-${id}-${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${id}/verify`
      })
    });

    const data = await paystackRes.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
