import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.rpc("subscriptions_growth_monthly");
  // If you don't have an RPC yet, you can instead group by date in SQL directly.

  if (error) return NextResponse.json([], { status: 500 });

  // Expecting [{ month: '2025-01', count: 10 }, ...]
  const result = (data ?? []).map((row: any) => ({
    label: row.month,
    value: row.count,
  }));

  return NextResponse.json(result);
}
