import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("licenseId");

    if (!licenseId) {
      return NextResponse.json(
        { error: "Missing licenseId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Fetch license
    const { data: license, error: licErr } = await supabase
      .from("License") // MUST match your actual table name
      .select("id, userId, annualFeePercent, annualFeePaidUntil")
      .eq("id", licenseId)
      .single();

    if (licErr || !license) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    // Fetch logged‑in user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.id !== license.userId) {
      return NextResponse.json(
        { error: "Unauthorized: License does not belong to this user" },
        { status: 403 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User email is required for Paystack checkout" },
        { status: 400 }
      );
    }

    // Calculate renewal amount
    const basePrice = 100000; // Replace with your real license price
    const percent = license.annualFeePercent ?? 20; // fallback safety
    const amount = Math.round((percent / 100) * basePrice);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid renewal amount" },
        { status: 400 }
      );
    }

    // Validate Paystack key
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paystack secret key missing in environment variables" },
        { status: 500 }
      );
    }

    // Validate callback base URL
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL is missing" },
        { status: 500 }
      );
    }

    // Create Paystack session
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
            licenseId,
            renewal: true,
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/renew-annual/verify`,
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
    });
  } catch (err) {
    console.error("Renew annual API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
