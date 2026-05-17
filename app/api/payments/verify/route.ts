import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;

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
    const userId = metadata.user_id;
    const companyId = metadata.company_id;

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
        userid: userId,
        amount: tx.amount / 100,
        currency: tx.currency,
        status: tx.status.toUpperCase(),
        reference: tx.reference,
        gateway: "PAYSTACK",
        created_at: new Date().toISOString(),
      });
    }

    // ----------------------------------------------------
    // ⭐ NEW LICENSE PURCHASE FLOW (20% RULE)
    // ----------------------------------------------------
    if (metadata.type === "NEW_LICENSE_PURCHASE") {
      const purchased = Number(metadata.plan);

      // 1. Update company license + annual fee
      const { data: company } = await supabase
        .from("companies")
        .select("license_count, annual_price")
        .eq("id", companyId)
        .single();

      if (company) {
        const newLicenseCount = company.license_count + purchased;
        const newAnnualFee = newLicenseCount * 0.20;

        await supabase
          .from("companies")
          .update({
            license_count: newLicenseCount,
            annual_price: newAnnualFee,
            updated_at: new Date().toISOString(),
          })
          .eq("id", companyId);
      }

      // 2. Update ClientBilling
      const annualFeeFromBuyPage = Number(metadata.annualFee);

      const { data: billing } = await supabase
        .from("ClientBilling")
        .select("annual_fee")
        .eq("userId", userId)
        .single();

      const existingAnnual = billing?.annual_fee ?? 0;
      const newAnnualFeeBilling = existingAnnual + annualFeeFromBuyPage;

      await supabase
        .from("ClientBilling")
        .update({
          annual_fee: newAnnualFeeBilling,
          updated_at: new Date().toISOString(),
        })
        .eq("userId", userId);

      // 3. Insert into AnnualPaymentHistory (correct column names)
      await supabase.from("AnnualPaymentHistory").insert({
        userid: userId,
        amount: tx.amount / 100,
        reference: tx.reference,
        status: tx.status.toUpperCase(),
        paidat: new Date().toISOString(),
        licensecount: purchased
      });
    }

    // ----------------------------------------------------
    // ANNUAL SUBSCRIPTION RENEWAL FLOW
    // ----------------------------------------------------
    if (metadata.type === "ANNUAL_RENEWAL") {
      const { data: billing } = await supabase
        .from("ClientBilling")
        .select("next_renewal_date")
        .eq("userId", userId)
        .single();

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

      // Insert into AnnualPaymentHistory (correct column names)
      await supabase.from("AnnualPaymentHistory").insert({
        userid: userId,
        amount: tx.amount / 100,
        reference: tx.reference,
        status: tx.status.toUpperCase(),
        paidat: new Date().toISOString(),
        licensecount: metadata.licenseCount ?? 0
      });
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: tx.customer.email,
      amount: tx.amount / 100,
      currency: tx.currency,
      reference: tx.reference,
      licenseId: metadata.licenseId ?? null,
    });

    // ----------------------------------------------------
    // SEND PAYMENT NOTIFICATION TO ADMIN
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
            <p><strong>Customer:</strong> ${tx.customer.email}</p>
            <p><strong>Amount:</strong> ${tx.amount / 100} ${tx.currency}</p>
            <p><strong>Reference:</strong> ${tx.reference}</p>
            <p><strong>Status:</strong> ${tx.status.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
