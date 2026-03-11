import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { license_id } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure license belongs to the user
  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  // Revoke license (free machine)
  await supabase
    .from("licenses")
    .update({
      is_active: false,
      auto_revoked: false,
      service_fee_paid: false,
      renewal_due_date: null,
    })
    .eq("id", license.id);

  // Log the revocation
  await supabase.from("license_renewal_history").insert({
    license_id: license.id,
    user_id: user.id,
    action: "revoked_by_client",
  });

  return NextResponse.json({ success: true });
}
