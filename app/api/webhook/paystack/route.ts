import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export async function POST(req: Request) {
  let logId: string | null = null;

  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Validate signature
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const reference = event.data?.reference || null;

    // 1. Log webhook immediately
    const { data: log, error: logErr } = await supabaseAdmin
      .from("webhook_logs")
      .insert({
        event_type: eventType,
        reference,
        raw_payload: event,
        status: "RECEIVED",
      })
      .select()
      .single();

    if (!log || logErr) {
      console.error("Webhook log failed:", logErr);
    } else {
      logId = log.id;
    }

    // Only handle successful charges
    if (eventType === "charge.success") {
      const data = event.data;

      const amount = data.amount / 100;
      const email = data.customer.email;
      const currency = data.currency;
      const gateway = "paystack";
      const channel = data.channel;

      // 2. Create invoice
      const { data: invoice, error: invErr } = await supabaseAdmin
        .from("invoices")
        .insert({
          company_id: null,
          amount,
          status: "PENDING",
          plan_name: "EMR Subscription",
        })
        .select()
        .single();

      if (invErr || !invoice) {
        await supabaseAdmin
          .from("webhook_logs")
          .update({ status: "FAILED", error: "Invoice creation failed" })
          .eq("id", logId);
        return NextResponse.json({ success: false });
      }

      // 3. Create payment
      const { data: payment, error: payErr } = await supabaseAdmin
        .from("payments")
        .insert({
          invoice_id: invoice.id,
          amount,
          reference,
          email,
          currency,
          status: "success",
          gateway,
          channel,
        })
        .select()
        .single();

      if (payErr || !payment) {
        await supabaseAdmin
          .from("webhook_logs")
          .update({ status: "FAILED", error: "Payment creation failed" })
          .eq("id", logId);
        return NextResponse.json({ success: false });
      }

      // 4. Trigger receipt email
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/payments/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      // 5. Mark webhook as processed
      await supabaseAdmin
        .from("webhook_logs")
        .update({ status: "PROCESSED", processed_at: new Date() })
        .eq("id", logId);

      return NextResponse.json({ success: true });
    }

    // Non-payment events
    await supabaseAdmin
      .from("webhook_logs")
      .update({ status: "IGNORED", processed_at: new Date() })
      .eq("id", logId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);

    if (logId) {
      await supabaseAdmin
        .from("webhook_logs")
        .update({ status: "FAILED", error: String(err) })
        .eq("id", logId);
    }

    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
