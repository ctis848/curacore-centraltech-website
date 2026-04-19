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
    const metadata = tx.metadata || {};

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
        userid: metadata.userId,
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
    // ANNUAL LICENSE RENEWAL FLOW (ALL ACTIVE LICENSES)
    // ----------------------------------------------------
    if (metadata.licenseId === "annual-fee") {
      const userId = metadata.userId;

      // Fetch all active licenses
      const { data: activeLicenses } = await supabase
        .from("License")
        .select("id, annualFeePaidUntil")
        .eq("userId", userId)
        .eq("status", "ACTIVE");

      if (activeLicenses && activeLicenses.length > 0) {
        for (const lic of activeLicenses) {
          const current = lic.annualFeePaidUntil
            ? new Date(lic.annualFeePaidUntil)
            : new Date();

          const newDate = new Date(
            current.setFullYear(current.getFullYear() + 1)
          );

          await supabase
            .from("License")
            .update({ annualFeePaidUntil: newDate.toISOString() })
            .eq("id", lic.id);
        }

        // Insert renewal history
        await supabase.from("AnnualPaymentHistory").insert({
          userId,
          amount: tx.amount / 100,
          reference: tx.reference,
          status: tx.status.toUpperCase(),
          paidAt: new Date().toISOString(),
          licenseCount: activeLicenses.length,
        });
      }
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: tx.customer.email,
      amount: tx.amount / 100,
      currency: tx.currency,
      reference: tx.reference,
      licenseId: metadata.licenseId,
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
