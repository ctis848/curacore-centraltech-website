import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  const { licenseKey, machineId, userId } = await req.json();

  if (!licenseKey || !machineId || !userId) {
    return NextResponse.json(
      { error: "Missing licenseKey, machineId or userId" },
      { status: 400 }
    );
  }

  const { data: license, error } = await supabaseAdmin
    .from("licenses")
    .select("*")
    .eq("key", licenseKey)
    .single();

  if (error || !license) {
    return NextResponse.json(
      { error: "Invalid license key" },
      { status: 404 }
    );
  }

  if (license.status === "revoked") {
    return NextResponse.json(
      { error: "License revoked" },
      { status: 403 }
    );
  }

  await supabaseAdmin
    .from("licenses")
    .update({
      status: "active",
      machine_id: machineId,
      user_id: userId,
      activated_at: new Date().toISOString(),
    })
    .eq("id", license.id);

  return NextResponse.json({ success: true, licenseId: license.id });
}
