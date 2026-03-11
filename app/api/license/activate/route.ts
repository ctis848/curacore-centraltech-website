import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { request_key } = await req.json();

  if (!request_key) {
    return NextResponse.json({ error: "Request key is required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find license by request key
  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("request_key", request_key)
    .single();

  if (!license) {
    return NextResponse.json({ error: "Invalid request key" }, { status: 404 });
  }

  // Activate license
  const { error } = await supabase
    .from("licenses")
    .update({
      user_id: user.id,
      is_active: true,
      auto_revoked: false,
      service_fee_paid: true,
      last_payment_date: new Date().toISOString(),
      renewal_due_date: new Date(
        new Date().getFullYear() + 1,
        new Date().getMonth(),
        new Date().getDate()
      ).toISOString(),
    })
    .eq("id", license.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Log activation
  await supabase.from("license_renewal_history").insert({
    license_id: license.id,
    user_id: user.id,
    action: "activated",
    metadata: { request_key },
  });

  return NextResponse.json({ success: true });
}
