// PATH: app/api/payments/renew-annual/verify/route.ts

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
    const licenseId = metadata.licenseId;
    const amount = metadata.annualRenewalAmount;

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // GET LICENSE
    // ----------------------------------------------------
    const { data: license } = await supabase
      .from("License")
      .select("annualFeePaidUntil, renewalCount, userId")
      .eq("id", licenseId)
      .single();

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    // ----------------------------------------------------
    // EXTEND RENEWAL BY 1 YEAR
    // ----------------------------------------------------
    const current = license.annualFeePaidUntil
      ? new Date(license.annualFeePaidUntil)
      : new Date();

    current.setFullYear(current.getFullYear() + 1);

    // ----------------------------------------------------
    // UPDATE LICENSE
    // ----------------------------------------------------
    await supabase
      .from("License")
      .update({
        annualFeePaidUntil: current.toISOString(),
        renewalCount: (license.renewalCount ?? 0) + 1,
      })
      .eq("id", licenseId);

    // ----------------------------------------------------
    // LOG PAYMENT (NO ERRORS)
    // ----------------------------------------------------
    await supabase.from("Payment").insert({
      userid: license.userId,
      amount,
      currency: "NGN",
      status: "success",
      reference,
      gateway: "paystack",
      purpose: "annual renewal",
      created_at: new Date().toISOString(),
    });

    // ----------------------------------------------------
    // LOG RENEWAL HISTORY
    // ----------------------------------------------------
    await supabase.from("RenewalHistory").insert({
      licenseId,
      reference,
      amount,
      paidAt: new Date().toISOString(),
    });

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL
    // ----------------------------------------------------
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/renewal-receipt`, {
      method: "POST",
      body: JSON.stringify({
        email: verifyData.data.customer.email,
        licenseId,
        amount,
        reference,
      }),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/client/renew-annual?success=1`
    );
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
