// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body?.event;
    const tx = body?.data;

    if (!event || !tx) {
      return NextResponse.json({ success: false, error: "Invalid webhook" });
    }

    if (event !== "charge.success") {
      return NextResponse.json({ success: true, message: "Ignored event" });
    }

    const reference = tx.reference;
    const email = tx.customer?.email;
    const amount = tx.amount / 100;
    const metadata = tx.metadata || {};

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // IDEMPOTENCY CHECK
    // ----------------------------------------------------
    const { data: existingPayment } = await supabase
      .from("Payment")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // ----------------------------------------------------
    // CHECK IF USER EXISTS
    // ----------------------------------------------------
    const { data: existingUser } = await supabase
      .from("auth.users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    const userId = existingUser?.id ?? null;

    // ----------------------------------------------------
    // INSERT PAYMENT RECORD
    // ----------------------------------------------------
    const { data: payment } = await supabase
      .from("Payment")
      .insert({
        userid: userId,
        email,
        amount,
        currency: tx.currency,
        status: "SUCCESS",
        reference,
        gateway: "PAYSTACK",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // ----------------------------------------------------
    // CREATE INVOICE
    // ----------------------------------------------------
    await supabase.from("Invoice").insert({
      payment_id: payment.id,
      userid: userId,
      email,
      amount,
      reference,
      created_at: new Date().toISOString(),
    });

    // ----------------------------------------------------
    // LICENSE PURCHASE FLOW
    // ----------------------------------------------------
    if (metadata.type === "NEW_LICENSE_PURCHASE") {
      const quantity = Number(metadata.quantity) || 0;

      // Increase license count
      if (userId) {
        const { data: client } = await supabase
          .from("Clients")
          .select("totalLicenses")
          .eq("userid", userId)
          .maybeSingle();

        const newTotal = (client?.totalLicenses || 0) + quantity;

        await supabase
          .from("Clients")
          .update({ totalLicenses: newTotal })
          .eq("userid", userId);
      }

      // Insert license purchase history
      await supabase.from("LicensePurchases").insert({
        userid: userId,
        email,
        quantity,
        amount,
        reference,
        created_at: new Date().toISOString(),
      });
    }

    // ----------------------------------------------------
    // ANNUAL RENEWAL FLOW
    // ----------------------------------------------------
    if (metadata.type === "ANNUAL_RENEWAL" && userId) {
      const { data: billing } = await supabase
        .from("ClientBilling")
        .select("next_renewal_date")
        .eq("userId", userId)
        .maybeSingle();

      const current = billing?.next_renewal_date
        ? new Date(billing.next_renewal_date)
        : new Date();

      const nextRenewal = new Date(
        current.setFullYear(current.getFullYear() + 1)
      ).toISOString();

      await supabase
        .from("ClientBilling")
        .update({
          next_renewal_date: nextRenewal,
          updated_at: new Date().toISOString(),
        })
        .eq("userId", userId);

      await supabase.from("AnnualPaymentHistory").insert({
        userid: userId,
        amount,
        reference,
        status: "SUCCESS",
        paidat: new Date().toISOString(),
        licensecount: metadata.licenseCount ?? 0,
      });
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: email,
      amount,
      currency: tx.currency,
      reference,
      licenseId: metadata.licenseId ?? null, // REQUIRED BY ReceiptPayload
    });

    // ----------------------------------------------------
    // ADMIN NOTIFICATION
    // ----------------------------------------------------
    if (BREVO_API_KEY) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "CTIS Tech", email: "no-reply@ctistech.com" },
          to: [{ email: "info@ctistech.com" }],
          subject: "New Payment Received",
          htmlContent: `
            <h2>New Payment Notification</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Amount:</strong> ${amount} ${tx.currency}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Status:</strong> SUCCESS</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
