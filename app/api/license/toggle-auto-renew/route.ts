import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { license_id, enabled } = body;

  if (!license_id || typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "license_id and enabled(boolean) are required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (licenseError || !license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabase
    .from("licenses")
    .update({ auto_renew: enabled })
    .eq("id", license_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update auto-renew setting" },
      { status: 500 }
    );
  }

  await supabase.from("license_renewal_history").insert({
    license_id,
    user_id: user.id,
    action: enabled ? "auto_renew_enabled" : "auto_renew_disabled",
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
