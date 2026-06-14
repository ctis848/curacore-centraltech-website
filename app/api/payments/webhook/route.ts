export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" });
    }

    const body = JSON.parse(rawBody);
    const event = body?.event;
    const tx = body?.data;

    if (event !== "charge.success") {
      return NextResponse.json({ success: true, message: "Ignored event" });
    }

    const reference = tx.reference;
    const email = tx.customer?.email;
    const amount = tx.amount / 100;
    const currency = tx.currency;
    const metadata = tx.metadata || {};

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // 1️⃣ IDEMPOTENCY CHECK
    // ----------------------------------------------------
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // ----------------------------------------------------
    // 2️⃣ FIND OR CREATE CLIENT
    // ----------------------------------------------------
    let clientId = metadata.clientId ?? null;

    if (!clientId && email) {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (client) {
        clientId = client.id;
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            company_name: metadata.companyName ?? "Unknown Company",
            email,
            phone: metadata.phone ?? null,
            address: metadata.address ?? null,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        clientId = newClient?.id ?? null;
      }
    }

    // ----------------------------------------------------
    // 3️⃣ INSERT PAYMENT RECORD
    // ----------------------------------------------------
    await supabase.from("payments").insert({
      client_id: clientId,
      amount,
      currency,
      status: "success",
      reference,
      email,
      gateway: "paystack",
      metadata,
      created_at: new Date().toISOString(),
    });

    // ----------------------------------------------------
    // 4️⃣ INSERT INVOICE RECORD (YOUR REQUIREMENT)
    // ----------------------------------------------------
    await supabase.from("invoices").insert({
      client_id: clientId,
      email,
      company_name: metadata.companyName ?? "",
      plan: metadata.plan ?? "",
      quantity: metadata.quantity ?? 1,
      amount,
      reference,
      created_at: new Date().toISOString(),
    });

    // ----------------------------------------------------
    // 5️⃣ SEND RECEIPT EMAIL TO CUSTOMER
    // ----------------------------------------------------
    if (email) {
      await sendReceiptEmail({
        to: email,
        amount,
        currency,
        reference,
        companyName: metadata.companyName ?? "",
        plan: metadata.plan ?? "",
        quantity: metadata.quantity ?? "",
        type: metadata.type ?? "",
        isAdmin: false,
      });
    }

    // ----------------------------------------------------
    // 6️⃣ SEND RECEIPT EMAIL TO ADMIN
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: "info@ctistech.com",
      amount,
      currency,
      reference,
      companyName: metadata.companyName ?? "",
      plan: metadata.plan ?? "",
      quantity: metadata.quantity ?? "",
      type: metadata.type ?? "",
      isAdmin: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
