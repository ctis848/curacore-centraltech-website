import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_BASE_URL = process.env.APP_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServer();
    const body = await req.json();
    const { licenseId, amount } = body;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const email = user.email;
    if (!email) {
      return NextResponse.json({ error: "User email missing" }, { status: 400 });
    }

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: "NGN",
        callback_url: `${APP_BASE_URL}/client/billing/renew-annual/callback`,
        metadata: {
          licenseId,
          userId: user.id,
        },
      }),
    });

    const initData = await initRes.json();

    if (!initData.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: initData.data.authorization_url,
      reference: initData.data.reference,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
