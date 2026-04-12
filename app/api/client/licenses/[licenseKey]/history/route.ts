import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  const { licenseKey } = await context.params;

  const { data: license, error: licErr } = await supabaseAdmin
    .from("licenses")
    .select("id")
    .eq("license_key", licenseKey)
    .single();

  if (licErr || !license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  const { data: activations, error: actErr } = await supabaseAdmin
    .from("machine_activations")
    .select("*")
    .eq("license_id", license.id)
    .order("activated_at", { ascending: false });

  return NextResponse.json({
    history: activations || [],
  });
}
