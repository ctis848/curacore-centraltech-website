import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const today = new Date().toISOString();

  const { data: licenses, error } = await supabase
    .from("licenses")
    .select("id, user_id, renewal_due_date, auto_renew, service_fee_paid")
    .eq("auto_renew", true)
    .lte("renewal_due_date", today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const license of licenses ?? []) {
    // Here you would trigger a Paystack charge using stored authorization
    await supabase.from("license_renewal_history").insert({
      license_id: license.id,
      user_id: license.user_id,
      action: "auto_renew_attempt",
      metadata: { renewal_due_date: license.renewal_due_date },
    });
  }

  return NextResponse.json({ success: true, processed: licenses?.length ?? 0 });
}
