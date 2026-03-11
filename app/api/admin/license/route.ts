import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: licenses, error } = await supabase
    .from("licenses")
    .select(
      "id, user_id, plan, is_active, auto_revoked, service_fee_paid, auto_renew, renewal_due_date"
    )
    .order("renewal_due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ licenses: licenses ?? [] });
}
