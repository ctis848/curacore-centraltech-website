import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("licenses")
    .select("active, revoked_at, activation_date");

  if (error) return NextResponse.json([], { status: 500 });

  const buckets: Record<string, { activated: number; revoked: number }> = {};

  (data ?? []).forEach((lic: any) => {
    const actKey = lic.activation_date
      ? lic.activation_date.slice(0, 10)
      : null;
    const revKey = lic.revoked_at ? lic.revoked_at.slice(0, 10) : null;

    if (actKey) {
      if (!buckets[actKey]) buckets[actKey] = { activated: 0, revoked: 0 };
      buckets[actKey].activated += 1;
    }

    if (revKey) {
      if (!buckets[revKey]) buckets[revKey] = { activated: 0, revoked: 0 };
      buckets[revKey].revoked += 1;
    }
  });

  const result = Object.entries(buckets)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({
      date,
      activated: v.activated,
      revoked: v.revoked,
    }));

  return NextResponse.json(result);
}
