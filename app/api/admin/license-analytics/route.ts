import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const [
    { count: active },
    { count: revoked },
    { data: upcoming },
    { data: renewed },
  ] = await Promise.all([
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("auto_revoked", true),
    supabase
      .from("licenses")
      .select("id, renewal_due_date")
      .gte("renewal_due_date", new Date().toISOString())
      .lte(
        "renewal_due_date",
        new Date(
          new Date().setDate(new Date().getDate() + 30)
        ).toISOString()
      ),
    supabase
      .from("license_renewal_history")
      .select("id")
      .eq("action", "renewed")
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      ),
  ]);

  return NextResponse.json({
    active: active ?? 0,
    auto_revoked: revoked ?? 0,
    upcoming_renewals: upcoming?.length ?? 0,
    renewals_this_month: renewed?.length ?? 0,
  });
}
