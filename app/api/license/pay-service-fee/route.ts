import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { license_id } = await req.json();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch license
  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  const now = new Date();

  // Update renewal fields
  const { error } = await supabase
    .from("licenses")
    .update({
      service_fee_paid: true,
      last_payment_date: now.toISOString(),
      renewal_due_date: new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      ).toISOString(),
      is_active: true,
      auto_revoked: false,
    })
    .eq("id", license.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
