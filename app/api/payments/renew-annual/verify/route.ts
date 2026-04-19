import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

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

    const supabase = supabaseServer();

    // Get license
    const { data: license } = await supabase
      .from("License")
      .select("annualFeePaidUntil")
      .eq("id", licenseId)
      .single();

    // Extend renewal by 1 year
    const current = license?.annualFeePaidUntil
      ? new Date(license.annualFeePaidUntil)
      : new Date();

    current.setFullYear(current.getFullYear() + 1);

    // Update license
    await supabase
      .from("License")
      .update({ annualFeePaidUntil: current.toISOString() })
      .eq("id", licenseId);

    // Log renewal history
    await supabase.from("RenewalHistory").insert({
      licenseId,
      reference,
      amount: verifyData.data.amount / 100,
      paidAt: new Date().toISOString(),
    });

    // Send receipt email
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/renewal-receipt`, {
      method: "POST",
      body: JSON.stringify({
        email: verifyData.data.customer.email,
        licenseId,
        amount: verifyData.data.amount / 100,
        reference,
      }),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/client/renew-annual?success=1`
    );
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
