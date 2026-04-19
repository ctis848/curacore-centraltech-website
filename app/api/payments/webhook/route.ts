import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // ----------------------------------------------------
    // VERIFY SIGNATURE
    // ----------------------------------------------------
    const hash = crypto
      .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful payments
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const tx = event.data;
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

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
