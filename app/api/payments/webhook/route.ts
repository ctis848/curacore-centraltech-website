// app/api/payments/webhook/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/sendReceiptEmail";

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const event = body?.event;
    const tx = body?.data;

    if (!event || !tx) {
      return NextResponse.json({ success: false, error: "Invalid webhook" });
    }

    if (event !== "charge.success") {
      return NextResponse.json({ success: true, message: "Ignored event" });
    }

    const reference: string = tx.reference;
    const email: string | undefined = tx.customer?.email;
    const amount: number = tx.amount / 100;
    const currency: string = tx.currency;
    const metadata: any = tx.metadata || {};

    const supabase = supabaseServer();

    // ----------------------------------------------------
    // IDEMPOTENCY CHECK
    // ----------------------------------------------------
    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from("Payment")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingPaymentError) {
      console.error("Error checking existing payment:", existingPaymentError);
    }

    if (existingPayment) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // ----------------------------------------------------
    // FIND OR CREATE CLIENT
    // ----------------------------------------------------
    let clientId: string | null = metadata.clientId ?? null;

    if (!clientId && email) {
      const { data: existingClient, error: existingClientError } = await supabase
        .from("Client")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingClientError) {
        console.error("Error checking existing client:", existingClientError);
      }

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: newClientError } = await supabase
          .from("Client")
          .insert({
            companyname: metadata.companyName ?? "Unknown Company",
            email,
            phone: metadata.phone ?? null,
            address: metadata.address ?? null,
          })
          .select()
          .single();

        if (newClientError) {
          console.error("Error creating client:", newClientError);
        } else {
          clientId = newClient?.id ?? null;
        }
      }
    }

    // ----------------------------------------------------
    // INSERT PAYMENT RECORD
    // (Only fields guaranteed by your Payment table schema)
    // ----------------------------------------------------
    const { data: payment, error: paymentError } = await supabase
      .from("Payment")
      .insert({
        userid: null,
        amount,
        currency,
        status: "SUCCESS",
        reference,
        gateway: "PAYSTACK",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error inserting payment:", paymentError);
    }

    // ----------------------------------------------------
    // LICENSE PURCHASE FLOW
    // ----------------------------------------------------
    if (metadata.type === "NEW_LICENSE_PURCHASE" && clientId) {
      const quantity = Number(metadata.quantity) || 1;
      const plan = (metadata.plan as string | undefined) ?? "starter";

      for (let i = 0; i < quantity; i++) {
        const { error: licenseError } = await supabase.from("License").insert({
          clientId,
          status: "ACTIVE",
          productName: plan,
          licenseKey: crypto.randomUUID(),
          purchasedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          annualFeePercent: 20,
          renewalstatus: "NOT_DUE",
          renewalduedate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
        });

        if (licenseError) {
          console.error("Error creating license:", licenseError);
        }
      }
    }

    // ----------------------------------------------------
    // ANNUAL RENEWAL FLOW
    // ----------------------------------------------------
    if (metadata.type === "ANNUAL_RENEWAL" && clientId) {
      const { data: licenses, error: licensesError } = await supabase
        .from("License")
        .select("id, renewalduedate")
        .eq("clientId", clientId);

      if (licensesError) {
        console.error("Error fetching licenses for renewal:", licensesError);
      }

      for (const lic of licenses ?? []) {
        const baseDate = lic.renewalduedate
          ? new Date(lic.renewalduedate)
          : new Date();
        baseDate.setFullYear(baseDate.getFullYear() + 1);

        const { error: updateError } = await supabase
          .from("License")
          .update({
            renewalduedate: baseDate.toISOString(),
            renewalstatus: "NOT_DUE",
          })
          .eq("id", lic.id);

        if (updateError) {
          console.error("Error updating license renewal:", updateError);
        }
      }
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL TO CUSTOMER
    // ----------------------------------------------------
    if (email) {
      await sendReceiptEmail({
        to: email,
        amount,
        currency,
        reference,
        licenseId: metadata.licenseId ?? null,
        companyName: metadata.companyName ?? "",
        plan: metadata.plan ?? "",
        quantity: metadata.quantity ?? "",
        type: metadata.type ?? "",
        isAdmin: false,
      });
    }

    // ----------------------------------------------------
    // SEND RECEIPT EMAIL TO ADMIN
    // ----------------------------------------------------
    await sendReceiptEmail({
      to: "info@ctistech.com",
      amount,
      currency,
      reference,
      licenseId: metadata.licenseId ?? null,
      companyName: metadata.companyName ?? "",
      plan: metadata.plan ?? "",
      quantity: metadata.quantity ?? "",
      type: metadata.type ?? "",
      isAdmin: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
