import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  const { subscriptionId, userId } = await req.json();

  if (!subscriptionId || !userId) {
    return NextResponse.json(
      { error: "Missing subscriptionId or userId" },
      { status: 400 }
    );
  }

  const { data: subscription, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .eq("user_id", userId)
    .single();

  if (error || !subscription) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  return NextResponse.json({ success: true });
}
