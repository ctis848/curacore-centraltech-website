// PATH: app/api/payments/renew-annual/route.ts

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("licenseId");

    if (!licenseId) {
      return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });
    }

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // FETCH LICENSE
    // ----------------------------------------------------
    const { data: license, error: licErr } = await supabase
      .from("License")
      .select("id, userId, plan, quantity, annualFeePaidUntil")
      .eq("id", licenseId)
      .single();

    if (licErr || !license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    // ----------------------------------------------------
    // AUTHENTICATED USER
    // ----------------------------------------------------
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    // ----------------------------------------------------
    // CALCULATE ANNUAL RENEWAL FEE
    // ----------------------------------------------------
    let planPrice = 0;

    if (license.plan === "Starter") planPrice = 250000;
    if (license.plan === "Pro") planPrice = 350000;
    if (license.plan === "Enterprise") planPrice = 550000;

    const maintenanceFeePerLicense = 0.20 * planPrice;
    const annualRenewalAmount = maintenanceFeePerLicense * license.quantity;

    if (annualRenewalAmount <= 0) {
      return NextResponse.json({ error: "Invalid renewal amount" }, { status: 400 });
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
          amount: annualRenewalAmount * 100,
          metadata: {
            type: "ANNUAL_RENEWAL",
            userId: user.id,
            licenseId,
            plan: license.plan,
            quantity: license.quantity,
            annualRenewalAmount,
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
      annualRenewalAmount,
    });
  } catch (err) {
    console.error("Renew annual API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
