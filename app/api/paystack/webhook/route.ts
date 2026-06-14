export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "info@ctistech.com";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // ----------------------------------------------------
    // 0️⃣ SECURITY: VERIFY SIGNATURE
    // ----------------------------------------------------
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Paystack signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const supabase = supabaseServer();

    console.log("📨 Paystack Event:", event.event);

    const allowedEvents = ["charge.success"];

    if (!allowedEvents.includes(event.event)) {
      console.log("ℹ️ Ignored event:", event.event);
      return NextResponse.json({ success: true, ignored: true });
    }

    const tx = event.data;
    const amount = tx.amount / 100;
    const reference = tx.reference;
    const metadata = tx.metadata || {};
    const customerEmail =
      metadata.email ??
      tx.customer?.email ??
      tx.customer?.customer_email ??
      null;

    console.log("💳 Payment received:", {
      email: customerEmail,
      amount,
      reference,
      type: metadata.type,
    });

    // ----------------------------------------------------
    // 1️⃣ IDEMPOTENCY CHECK
    // ----------------------------------------------------
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate payment — skipping");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // ----------------------------------------------------
    // 2️⃣ INSERT PAYMENT RECORD
    // ----------------------------------------------------
    await supabase.from("payments").insert({
      amount,
      currency: "NGN",
      status: "success",
      reference,
      email: customerEmail,
      gateway: "paystack",
      channel: event.event,
      metadata,
      created_at: new Date().toISOString(),
    });

    console.log("✅ Payment inserted into payments table");

    // ----------------------------------------------------
    // 3️⃣ HANDLE ANNUAL RENEWAL
    // ----------------------------------------------------
    if (metadata.type === "ANNUAL_RENEWAL") {
      console.log("🔥 Processing Annual Renewal");

      const clientId = metadata.clientId;

      if (!clientId) {
        console.error("❌ Missing clientId for renewal");
        return NextResponse.json(
          { success: false, error: "Missing clientId" },
          { status: 400 }
        );
      }

      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (!client) {
        console.error("❌ Client not found");
        return NextResponse.json(
          { success: false, error: "Client not found" },
          { status: 404 }
        );
      }

      const now = new Date();
      const newExpiry = new Date(
        now.setFullYear(now.getFullYear() + 1)
      ).toISOString();

      await supabase
        .from("clients")
        .update({ renewal_due_date: newExpiry })
        .eq("id", clientId);

      await supabase.from("renewal_history").insert({
        client_id: clientId,
        amount,
        reference,
        paid_at: tx.paid_at,
        created_at: new Date().toISOString(),
      });

      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: "Annual Renewal Successful",
          html: `
            <h2>Your Annual Renewal is Complete</h2>
            <p><strong>Company:</strong> ${metadata.companyName}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Next Renewal Date:</strong> ${new Date(
              newExpiry
            ).toDateString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
          `,
        });
      }

      console.log("✅ Annual renewal completed");
    }

    // ----------------------------------------------------
    // 4️⃣ HANDLE NEW LICENSE PURCHASE
    // ----------------------------------------------------
    if (metadata.type === "NEW_LICENSE_PURCHASE") {
      console.log("🔥 Processing License Purchase");

      const plan = metadata.plan;
      const quantity = Number(metadata.quantity || 1);
      const companyName = metadata.companyName;

      // 1) Find or create client
      const { data: existingClient } = await supabase
        .from("clients")
        .select("*")
        .eq("email", customerEmail)
        .maybeSingle();

      let clientId;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: created } = await supabase
          .from("clients")
          .insert({
            email: customerEmail,
            company_name: companyName,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        clientId = created?.id;
      }

      // 2) Create licenses
      for (let i = 0; i < quantity; i++) {
        await supabase.from("licenses").insert({
          client_id: clientId,
          product_name: plan,
          license_key: crypto.randomUUID(),
          status: "ACTIVE",
          purchased_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
          renewal_status: "NOT_DUE",
          renewal_due_date: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
        });
      }

      // 3) Log purchase
      await supabase.from("license_purchases").insert({
        client_id: clientId,
        plan,
        quantity,
        amount,
        reference,
        created_at: new Date().toISOString(),
      });

      // 4) Send receipt email
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: "Your CentralCore Payment Receipt",
          html: `
            <h2>Payment Successful</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Reference:</strong> ${reference}</p>
          `,
        });
      }

      console.log("✅ License purchase completed");
    }

    // ----------------------------------------------------
    // 5️⃣ SEND ADMIN EMAIL
    // ----------------------------------------------------
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
          <p><strong>Type:</strong> ${metadata.type}</p>
        `,
      }),
    });

    console.log("🎉 WEBHOOK COMPLETED SUCCESSFULLY");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
