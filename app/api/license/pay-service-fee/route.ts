import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { license_id, amount } = body;

  if (!license_id || !amount) {
    return NextResponse.json(
      { error: "license_id and amount are required" },
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

  // Update license as paid
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      service_fee_paid: true,
      service_fee_paid_at: new Date().toISOString(),
    })
    .eq("id", license_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update license" },
      { status: 500 }
    );
  }

  // Log renewal history
  await supabase.from("license_renewal_history").insert({
    license_id,
    user_id: user.id,
    action: "service_fee_paid",
    metadata: { amount },
  });

  return NextResponse.json({ success: true });
}
