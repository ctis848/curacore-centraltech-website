import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { license_id } = body;

  if (!license_id) {
    return NextResponse.json(
      { error: "license_id is required" },
      { status: 400 }
    );
  }

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify license belongs to user
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

  // Revoke license
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", license_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to revoke license" },
      { status: 500 }
    );
  }

  // Log revocation
  await supabase.from("license_renewal_history").insert({
    license_id,
    user_id: user.id,
    action: "revoked",
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
