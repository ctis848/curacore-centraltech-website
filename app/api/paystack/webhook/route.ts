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
      meta.email ?? data.customer?.email ?? data.customer?.customer_email ?? null;

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

    // 🔹 Link to user if exists
    const { data: user } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();

    const userId = user?.id || null;

    // 🔹 Prevent duplicate
    const { data: existing } = await supabase
      .from("Payment")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate payment — skipping");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 🔹 Insert payment record (payment history)
    const { error: insertError } = await supabase.from("Payment").insert({
      userid: userId,
      amount,
      currency: "NGN",
      status: "success",
      reference,
      gateway: "paystack",
      channel: event.event,
    });

    if (insertError) {
      console.log("❌ Payment insert failed:", insertError);
      return NextResponse.json(
        { success: false, error: "DB insert failed", details: insertError },
        { status: 500 }
      );
    }

    console.log("✅ Payment inserted into Payment table");

    // =====================================================
    // 1️⃣ ANNUAL RENEWAL FLOW
    // =====================================================
    if (meta.type === "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING ANNUAL RENEWAL");

      // companyId & companyName expected in metadata
      const companyId = meta.companyId;
      const companyName = meta.companyName;

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (companyError || !company) {
        console.log("❌ Company not found for renewal:", companyError);
        return NextResponse.json(
          { success: false, error: "Company not found for renewal" },
          { status: 404 }
        );
      }

      // Find or create license for this company
      let { data: license } = await supabase
        .from("License")
        .select("*")
        .eq("companyId", company.id)
        .maybeSingle();

      if (!license) {
        const { data: newLicense, error: newLicErr } = await supabase
          .from("License")
          .insert({
            companyId: company.id,
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (newLicErr) {
          console.log("❌ Failed to create license:", newLicErr);
          return NextResponse.json(
            { success: false, error: "Failed to create license" },
            { status: 500 }
          );
        }

        license = newLicense;
      }

      const now = new Date();
      const newExpiry = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("License")
        .update({
          expiresAt: newExpiry,
          updatedAt: now.toISOString(),
        })
        .eq("id", license.id);

      const nextRenewal = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("companies")
        .update({ renewal_date: nextRenewal })
        .eq("id", company.id);

      await supabase.from("AnnualPaymentHistory").insert({
        companyId: company.id,
        amount,
        reference,
        status: "success",
        paidat: data.paid_at,
        licensecount: company.license_count,
      });

      // Email: Annual renewal successful
      if (customerEmail) {
        sendEmail({
          to: customerEmail,
          subject: "Annual Renewal Successful",
          html: `
            <h2>Your Annual Renewal is Complete</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Next Renewal Date:</strong> ${new Date(
              nextRenewal
            ).toLocaleDateString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
          `,
        }).catch((e) => console.error("🔥 EMAIL ERROR:", e));
      }

      console.log("✅ Annual renewal flow completed");
    }

    // =====================================================
    // 2️⃣ NEW LICENSE PURCHASE FLOW
    // =====================================================
    if (meta.type !== "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING NEW LICENSE PURCHASE");

      const { data: existingClient } = await supabase
        .from("Clients")
        .select("*")
        .eq("email", customerEmail)
        .maybeSingle();

      let clientId;

      if (existingClient) {
        const newTotal =
          (existingClient.totalLicenses || 0) + Number(meta.quantity || 0);

        const { data: updated } = await supabase
          .from("Clients")
          .update({
            totalLicenses: newTotal,
            companyName: meta.companyName,
          })
          .eq("id", existingClient.id)
          .select()
          .single();

        clientId = updated?.id || existingClient.id;
      } else {
        const { data: created } = await supabase
          .from("Clients")
          .insert({
            email: customerEmail,
            companyName: meta.companyName,
            totalLicenses: meta.quantity,
          })
          .select()
          .single();

        clientId = created?.id;
      }

      await supabase.from("LicensePurchases").insert({
        clientId,
        plan: meta.plan,
        quantity: meta.quantity,
        amount,
        reference,
      });

      // Email: License purchase receipt
      if (customerEmail) {
        sendEmail({
          to: customerEmail,
          subject: "Your CentralCore License Receipt",
          html: `
            <h2>Payment Successful</h2>
            <p><strong>Company:</strong> ${meta.companyName}</p>
            <p><strong>Plan:</strong> ${meta.plan}</p>
            <p><strong>Quantity:</strong> ${meta.quantity}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
          `,
        }).catch((e) => console.error("🔥 EMAIL ERROR:", e));
      }

      console.log("✅ New license purchase flow completed");
    }

    // =====================================================
    // 3️⃣ ADMIN + GENERIC RECEIPT (OPTIONAL, VIA BREVO)
    // =====================================================
    if (customerEmail) {
      // Admin notification
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
            <p><strong>Type:</strong> ${meta.type || "UNKNOWN"}</p>
          `,
        }),
      }).catch((e) => console.error("🔥 ADMIN EMAIL ERROR:", e));
    }

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
