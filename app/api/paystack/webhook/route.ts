export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    console.log("🔔 WEBHOOK HIT — Raw body received");

    // 1️⃣ Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    console.log("🔐 Signature from Paystack:", signature);
    console.log("🔐 Signature computed:", hash);

    if (hash !== signature) {
      console.log("❌ Invalid signature — rejecting request");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    console.log("📨 Event received:", event.event);

    // Only handle successful payments
    if (event.event !== "charge.success") {
      console.log("ℹ️ Ignored event:", event.event);
      return NextResponse.json({ success: true, ignored: true });
    }

    const payment = event.data;
    const amount = payment.amount / 100;
    const customerEmail = payment.customer.email;
    const reference = payment.reference;
    const metadata = payment.metadata || {};

    console.log("💳 Payment details:");
    console.log("   Email:", customerEmail);
    console.log("   Amount:", amount);
    console.log("   Reference:", reference);
    console.log("   Metadata:", metadata);

    const supabase = supabaseServer();

    // 2️⃣ Check if user exists
    const { data: user, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();

    if (userError) console.log("⚠️ User lookup error:", userError);
    console.log("👤 User found:", user ? user.id : "NO — new client");

    const userId = user?.id || null;

    // 3️⃣ Prevent duplicate payments
    const { data: existing } = await supabase
      .from("Payment")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate payment detected — skipping insert");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 4️⃣ Insert Payment ALWAYS
    console.log("📝 Inserting payment into database…");

    const { error: insertError } = await supabase.from("Payment").insert({
      userid: userId,
      amount,
      currency: "NGN",
      status: "success",
      reference,
      gateway: "paystack",
    });

    if (insertError) {
      console.log("❌ Payment insert FAILED:", insertError);
      return NextResponse.json(
        { success: false, error: "DB insert failed", details: insertError },
        { status: 500 }
      );
    }

    console.log("✅ Payment inserted successfully");

    // 5️⃣ If user does NOT exist → send signup email
    if (!userId) {
      console.log("📧 Sending signup-required email to:", customerEmail);

      const apiKey = process.env.BREVO_API_KEY;
      const notifyEmail = process.env.NOTIFY_EMAIL || "info@ctistech.com";

      const signupEmail = {
        sender: { name: "CentralCore Billing", email: notifyEmail },
        to: [{ email: customerEmail }],
        subject: "Complete Signup to Activate Your License",
        htmlContent: `
          <h2>Action Required</h2>
          <p>Your payment was successful, but we could not find an account associated with your email.</p>
          <p>Please return to the signup page and create an account using this same email to activate your license.</p>
          <p><strong>Reference:</strong> ${reference}</p>
        `,
      };

      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupEmail),
      });

      console.log("📨 Signup email response:", emailRes.status);

      return NextResponse.json({ success: true, user_missing: true });
    }

    // 6️⃣ Existing user → send admin + client emails
    console.log("📧 Sending admin + client receipt emails…");

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL || "info@ctistech.com";

    const adminPayload = {
      sender: { name: "CentralCore Payment", email: notifyEmail },
      to: [{ email: notifyEmail }],
      subject: "New Payment Received",
      htmlContent: `
        <h2>New Payment Received</h2>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Plan:</strong> ${metadata.plan}</p>
      `,
    };

    const adminRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminPayload),
    });

    console.log("📨 Admin email response:", adminRes.status);

    const clientPayload = {
      sender: { name: "CentralCore Billing", email: notifyEmail },
      to: [{ email: customerEmail }],
      subject: "Payment Receipt – CentralCore",
      htmlContent: `
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment.</p>
        <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p>Your payment has been successfully processed.</p>
        <p>You may now proceed to request your license.</p>
      `,
    };

    const clientRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientPayload),
    });

    console.log("📨 Client email response:", clientRes.status);

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
