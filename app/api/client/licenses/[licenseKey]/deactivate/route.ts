import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  try {
    const { licenseKey } = await context.params;

    const { data: license, error: licErr } = await supabaseAdmin
      .from("licenses")
      .select("id")
      .eq("license_key", licenseKey)
      .single();

    if (licErr || !license) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    const { error: updErr } = await supabaseAdmin
      .from("licenses")
      .update({
        status: "EXPIRED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    if (updErr) {
      console.error("DEACTIVATE ERROR:", updErr);
      return NextResponse.json(
        { error: "Failed to deactivate license" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DEACTIVATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
