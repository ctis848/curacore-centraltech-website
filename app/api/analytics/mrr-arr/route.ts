import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("status, plan_id, created_at")
    .eq("status", "active");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: plans, error: planError } = await supabaseAdmin
    .from("plans")
    .select("id, price, interval");

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  const planMap = new Map<string, { price: number; interval: string }>();
  (plans ?? []).forEach((p: any) =>
    planMap.set(p.id, { price: Number(p.price), interval: p.interval })
  );

  let mrr = 0;
  let arr = 0;

  (data ?? []).forEach((sub: any) => {
    const plan = planMap.get(sub.plan_id);
    if (!plan) return;

    if (plan.interval === "monthly") {
      mrr += plan.price;
      arr += plan.price * 12;
    } else if (plan.interval === "yearly") {
      arr += plan.price;
      mrr += plan.price / 12;
    }
  });

  return NextResponse.json({
    mrr: Number(mrr.toFixed(2)),
    arr: Number(arr.toFixed(2)),
  });
}
