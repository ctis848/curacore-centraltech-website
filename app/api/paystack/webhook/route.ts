import { NextResponse } from "next/server";
import crypto from "crypto";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = process.env.PAYSTACK_SECRET_KEY as string;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  if (body.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const metadata = body.data.metadata;
  const license_id = metadata.license_id;

  const supabase = createRouteHandlerClient({ cookies });

  const now = new Date();
  await supabase
    .from("licenses")
    .update({
      service_fee_paid: true,
      last_payment_date: now.toISOString(),
      renewal_due_date: new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      ).toISOString(),
      is_active: true,
      auto_revoked: false,
    })
    .eq("id", license_id);

  await supabase.from("license_renewal_history").insert({
    license_id,
    user_id: body.data.customer?.id ?? null,
    action: "renewed",
    metadata: body.data,
  });

  return NextResponse.json({ received: true });
}
