import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 29);

  const { data, error } = await supabaseAdmin
    .from("activation_codes")
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error) return NextResponse.json([], { status: 500 });

  const buckets: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  (data ?? []).forEach((row: any) => {
    const key = row.created_at.slice(0, 10);
    if (buckets[key] !== undefined) buckets[key] += 1;
  });

  const result = Object.entries(buckets).map(([date, value]) => ({
    date,
    value,
  }));

  return NextResponse.json(result);
}
