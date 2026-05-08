import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing reference" },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "PAYSTACK_SECRET_KEY not configured" },
        { status: 500 }
      );
    }

    // ----------------------------------------------------
    // VERIFY WITH PAYSTACK
    // ----------------------------------------------------
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || !verifyData.data) {
      return NextResponse.json(
        { success: false, error: "Verification failed" },
        { status: 400 }
      );
    }

    const tx = verifyData.data;

    // Only process successful transactions
    if (tx.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Transaction not successful" },
        { status: 400 }
      );
    }

    const metadata = tx.metadata || {};
    const userId = metadata.userId as string | undefined;

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // IDEMPOTENCY CHECK
    // ----------------------------------------------------
    const { data: existing } = await supabase
      .from("Payment")
      .select("id")
      .eq("reference", tx.reference)
      .maybeSingle();

    if (!existing) {
      await supabase.from("Payment").insert({
        userid: userId ?? null,
        amount: tx.amount / 100,
        currency: tx.currency,
        status: tx.status.toUpperCase(),
        reference: tx.reference,
        gateway: "PAYSTACK",
        created_at: new Date().toISOString(),
      });
    }

    // ----------------------------------------------------
    // INVOICE PAYMENT FLOW
    // ----------------------------------------------------
    if (metadata.invoiceId) {
      await supabase
        .from("Invoice")
        .update({
          status: "PAID",
          paidAt: new Date().toISOString(),
          transactionId: tx.id,
        })
        .eq("id", metadata.invoiceId);
    }

    // ----------------------------------------------------
    // NEW LICENSE PURCHASE FLOW (20% RULE FOR EXISTING CLIENTS)
    // ----------------------------------------------------
    if (metadata.type === "NEW_LICENSE_PURCHASE" && userId) {
      const quantity = Number(metadata.quantity) || 0;
      const annualFeeFromBuyPage = Number(metadata.annualFee) || 0; // already 20% × price × qty

      const { data: billing, error: billingError } = await supabase
        .from("ClientBilling")
        .select("annual_fee")
        .eq("userId", userId)
        .maybeSingle();

      if (!billingError) {
        const existingAnnual = billing?.annual_fee ?? 0;
        const newAnnualFee = existingAnnual + annualFeeFromBuyPage;

        await supabase
          .from("ClientBilling")
          .update({
            annual_fee: newAnnualFee,
            updated_at: new Date().toISOString(),
          })
          .eq("userId", userId);

        await supabase.from("AnnualPaymentHistory").insert({
          userId,
          amount: tx.amount / 100,
          reference: tx.reference,
          status: tx.status.toUpperCase(),
          paidAt: new Date().toISOString(),
          licenseCount: quantity,
          description: "Additional License Purchase (20% Annual Fee Applied)",
        });
      }
    }

    // ----------------------------------------------------
    // ANNUAL SUBSCRIPTION RENEWAL FLOW (CLIENT-LEVEL)
    // ----------------------------------------------------
    if (metadata.type === "ANNUAL_RENEWAL" && userId) {
      const { data: billing, error: billingError } = await supabase
        .from("ClientBilling")
        .select("next_renewal_date")
        .eq("userId", userId)
        .maybeSingle();

      if (!billingError) {
        const currentDate = billing?.next_renewal_date
          ? new Date(billing.next_renewal_date)
          : new Date();

        const newRenewalDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() + 1)
        ).toISOString();

        await supabase
          .from("ClientBilling")
          .update({
            next_renewal_date: newRenewalDate,
            updated_at: new Date().toISOString(),
          })
          .eq("userId", userId);

        await supabase.from("AnnualPaymentHistory").insert({
          userId,
          amount: tx.amount / 100,
          reference: tx.reference,
          status: tx.status.toUpperCase(),
          paidAt: new Date().toISOString(),
          description: "Annual Subscription Renewal",
        });
      }
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: tx.customer?.email,
      amount: tx.amount / 100,
      currency: tx.currency,
      reference: tx.reference,
      licenseId: metadata.licenseId ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
