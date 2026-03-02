import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found for this user" },
        { status: 404 }
      );
    }

    // Create renewal request record
    const { error: renewError } = await supabase
      .from("subscription_renewals")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    if (renewError) {
      return NextResponse.json(
        { error: "Failed to create renewal request" },
        { status: 500 }
      );
    }

    // Placeholder payment URL (replace with Paystack/Flutterwave later)
    const paymentUrl = `https://centraltechis.com/pay/renew?user=${userId}`;

    return NextResponse.json({
      message: "Renewal request created successfully.",
      paymentUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
