import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;

      // Prevent duplicate processing
      const { data: existing } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("reference", data.reference)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("payments").insert({
          reference: data.reference,
          email: data.customer.email,
          amount: data.amount / 100,
          status: data.status,
          gateway: "paystack",
        });
      }

      // Activate subscription or license
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active" })
        .eq("reference", data.reference);

      await supabaseAdmin
        .from("licenses")
        .update({ status: "active" })
        .eq("reference", data.reference);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
