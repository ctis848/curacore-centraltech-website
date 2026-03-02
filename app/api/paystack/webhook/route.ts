import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Validate Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful payments
    if (event.event !== "charge.success") {
      return NextResponse.json({ status: "ignored" });
    }

    const data = event.data;
    const reference = data.reference;
    const amount = data.amount / 100;
    const email = data.customer.email;
    const plan = data.metadata?.plan;
    const user_id = data.metadata?.user_id;

    // 1. Create invoice
    await supabaseAdmin.from("invoices").insert({
      user_id,
      plan,
      amount,
      transaction_ref: reference,
      status: "paid",
    });

    // 2. Generate license key
    const license_key = `CENTRALCORE-${crypto
      .randomBytes(8)
      .toString("hex")
      .toUpperCase()}`;

    // 3. Store license in Supabase
    await supabaseAdmin.from("licenses").insert({
      user_id,
      license_key,
      plan,
      status: "active",
    });

    // 4. Send email using GoDaddy SMTP
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.CTIS_EMAIL_USER,       // info@ctistech.com
        pass: process.env.CTIS_EMAIL_PASSWORD,   // your email password
      },
    });

    await transporter.sendMail({
      from: `CentralCore EMR <${process.env.CTIS_EMAIL_USER}>`,
      to: email,
      subject: "Your CentralCore EMR License Receipt",
      html: `
        <h2>Payment Successful</h2>
        <p>Thank you for purchasing the <strong>${plan}</strong> license.</p>

        <p><strong>Amount Paid:</strong> ₦${amount}</p>
        <p><strong>Transaction Reference:</strong> ${reference}</p>

        <h3>Your License Key</h3>
        <pre style="font-size:20px;font-weight:bold">${license_key}</pre>

        <p>You can now activate your license inside the CentralCore EMR dashboard.</p>
      `,
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
