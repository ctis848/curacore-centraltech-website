import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { activationMessage } from "@/lib/messages/activation";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  // Verify payment with Paystack
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData?.status || verifyData.data.status !== "success") {
    return NextResponse.json(
      { error: "Payment verification failed", details: verifyData },
      { status: 400 }
    );
  }

  const { email, plan, user_id, fullName } = verifyData.data.metadata;

  // Activate license
  const activatedAt = new Date();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await supabase.from("licenses").upsert({
    user_id,
    plan,
    activated_at: activatedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
  });

  // Build activation message
  const message = activationMessage(fullName, plan);

  // WhatsApp Cloud API
  await fetch(
    `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: verifyData.data.customer.phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`
  );
}
