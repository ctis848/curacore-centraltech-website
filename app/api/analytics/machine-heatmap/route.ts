import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Last 7 days
  const { data, error } = await supabaseAdmin
    .from("activation_codes")
    .select("created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (error) return NextResponse.json([], { status: 500 });

  const counts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    counts[key] = 0;
  }

  (data ?? []).forEach((row: any) => {
    const key = (row.created_at as string).slice(0, 10);
    if (counts[key] !== undefined) counts[key] += 1;
  });

  const result = Object.entries(counts).map(([label, value]) => ({
    label,
    value,
  }));

  return NextResponse.json(result);
}
