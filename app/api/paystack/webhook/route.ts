import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const isValid = verifyPaystackSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const metadata = event.data.metadata || {};
    const license_id = metadata.license_id;
    const user_id = metadata.user_id;

    if (license_id && user_id) {
      await supabase
        .from("licenses")
        .update({
          service_fee_paid: true,
          service_fee_paid_at: new Date().toISOString(),
        })
        .eq("id", license_id);

      await supabase.from("license_renewal_history").insert({
        license_id,
        user_id,
        action: "service_fee_paid",
        metadata: { reference: event.data.reference },
      });
    }
  }

  return NextResponse.json({ received: true });
}
