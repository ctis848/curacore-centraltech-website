export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "info@ctistech.com";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const supabase = supabaseServer();

    console.log("📨 Paystack Event:", event.event);

    const allowedEvents = [
      "charge.success",
      "transfer.success",
      "dedicatedaccount.payment",
    ];

    if (!allowedEvents.includes(event.event)) {
      console.log("ℹ️ Ignored event:", event.event);
      return NextResponse.json({ success: true, ignored: true });
    }

    const data = event.data;
    const amount = data.amount / 100;
    const paystackId = data.id;
    const meta = data.metadata || {};

    const customerEmail =
      meta.email ??
      data.customer?.email ??
      data.customer?.customer_email ??
      null;

    const reference =
      data.reference ||
      data.transfer_code ||
      `DVA-${paystackId}`;

    console.log("💳 Payment received:", {
      email: customerEmail,
      amount,
      reference,
      type: meta.type,
    });

    // 🔹 Prevent duplicate
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate payment — skipping");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 🔹 Insert into payments table
    await supabase.from("payments").insert({
      amount,
      currency: "NGN",
      status: "success",
      reference,
      email: customerEmail,
      gateway: "paystack",
      channel: event.event,
      created_at: new Date().toISOString(),
    });

    console.log("✅ Payment inserted into payments table");

    // =====================================================
    // 1️⃣ ANNUAL RENEWAL FLOW
    // =====================================================
    if (meta.type === "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING ANNUAL RENEWAL");

      const companyId = meta.companyId;
      const companyName = meta.companyName;

      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (!company) {
        console.log("❌ Company not found for renewal");
        return NextResponse.json(
          { success: false, error: "Company not found" },
          { status: 404 }
        );
      }

      const now = new Date();
      const newExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      await supabase
        .from("companies")
        .update({
          renewal_date: newExpiry.toISOString(),
        })
        .eq("id", company.id);

      await supabase.from("AnnualPaymentHistory").insert({
        companyId: company.id,
        amount,
        reference,
        status: "success",
        paidat: data.paid_at,
        licensecount: company.license_count,
      });

      console.log("📧 Sending renewal email to client…");

      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: "Annual Renewal Successful",
          html: `
            <h2>Your Annual Renewal is Complete</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Next Renewal Date:</strong> ${newExpiry.toDateString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
          `,
        }).catch((e) => console.error("🔥 EMAIL ERROR:", e));
      }

      console.log("✅ Annual renewal flow completed");
    }

    // =====================================================
    // 2️⃣ NEW OR EXISTING CLIENT LICENSE PURCHASE FLOW
    // =====================================================
    if (meta.type !== "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING LICENSE PURCHASE");

      const plan = meta.plan;
      const quantity = Number(meta.quantity || 1);
      const companyName = meta.companyName;

      // 1) Check if client exists
      const { data: existingClient } = await supabase
        .from("Clients")
        .select("*")
        .eq("email", customerEmail)
        .maybeSingle();

      let clientId;
      let totalLicenses;

      if (existingClient) {
        totalLicenses = (existingClient.totalLicenses || 0) + quantity;

        const { data: updated } = await supabase
          .from("Clients")
          .update({
            totalLicenses,
            companyName,
            annualRenewal: totalLicenses * 0.20,
          })
          .eq("id", existingClient.id)
          .select()
          .single();

        clientId = updated?.id || existingClient.id;
      } else {
        totalLicenses = quantity;

        const { data: created } = await supabase
          .from("Clients")
          .insert({
            email: customerEmail,
            companyName,
            totalLicenses,
            annualRenewal: totalLicenses * 0.20,
          })
          .select()
          .single();

        clientId = created?.id;
      }

      // 2) Add payment to Client Payment History
      await supabase.from("LicensePurchases").insert({
        clientId,
        plan,
        quantity,
        amount,
        reference,
        channel: event.event,
      });

      // 3) Send receipt email to client
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: "Your CentralCore Payment Receipt",
          html: `
            <h2>Payment Successful</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total Licenses Now:</strong> ${totalLicenses}</p>
            <p><strong>Annual Renewal Fee:</strong> ₦${(totalLicenses * 0.20).toLocaleString()}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Payment Method:</strong> ${event.event}</p>
          `,
        }).catch((e) => console.error("🔥 CLIENT EMAIL ERROR:", e));
      }

      console.log("✅ License purchase flow completed");
    }

    // =====================================================
    // 3️⃣ ADMIN EMAIL NOTIFICATION
    // =====================================================
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CentralCore Payment", email: NOTIFY_EMAIL },
        to: [{ email: NOTIFY_EMAIL }],
        subject: "New Payment Received",
        htmlContent: `
          <h2>New Payment Received</h2>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Type:</strong> ${meta.type || "LICENSE PURCHASE"}</p>
        `,
      }),
    }).catch((e) => console.error("🔥 ADMIN EMAIL ERROR:", e));

    console.log("🎉 WEBHOOK COMPLETED SUCCESSFULLY");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 Paystack Webhook Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
