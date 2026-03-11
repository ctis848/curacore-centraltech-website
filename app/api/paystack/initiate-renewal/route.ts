import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { license_id } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  const amountKobo = 2000 * 100; // example: ₦2000 as 20% fee

  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: amountKobo,
      metadata: { license_id: license.id, type: "service_fee" },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/client/payment/callback`,
    }),
  });

  const initData = await initRes.json();
  if (!initData.status) {
    return NextResponse.json({ error: initData.message }, { status: 400 });
  }

  return NextResponse.json({
    authorization_url: initData.data.authorization_url,
  });
}
