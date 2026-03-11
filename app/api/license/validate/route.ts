import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { license_key, machine_id } = await req.json();

  // Fetch license
  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", license_key)
    .single();

  if (!license) {
    return NextResponse.json({ valid: false, reason: "Invalid license" });
  }

  // Inactive license
  if (!license.is_active) {
    return NextResponse.json({ valid: false, reason: "License inactive" });
  }

  // Expired license
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, reason: "License expired" });
  }

  // Renewal overdue → auto revoke
  if (
    license.renewal_due_date &&
    new Date(license.renewal_due_date) < new Date() &&
    !license.service_fee_paid
  ) {
    await supabase
      .from("licenses")
      .update({ is_active: false, auto_revoked: true })
      .eq("id", license.id);

    return NextResponse.json({
      valid: false,
      reason: "Service fee overdue. License revoked.",
    });
  }

  // Machine limit enforcement
  const { count: machineCount } = await supabase
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", license.user_id);

  if ((machineCount ?? 0) >= license.machine_limit) {
    return NextResponse.json({
      valid: false,
      reason: "Machine limit reached",
    });
  }

  // OPTIONAL: Machine binding logic
  // If you want to enforce one-machine-per-license, add it here.

  return NextResponse.json({ valid: true, license });
}
