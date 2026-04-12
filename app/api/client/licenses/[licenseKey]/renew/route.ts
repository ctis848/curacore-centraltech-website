import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  try {
    const { licenseKey } = await context.params;

    const { data: license } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("license_key", licenseKey)
      .single();

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    const base = license.annual_fee_paid_until
      ? new Date(license.annual_fee_paid_until)
      : new Date();

    const nextYear = new Date(base);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const { data: updated } = await supabaseAdmin
      .from("licenses")
      .update({
        annual_fee_paid_until: nextYear.toISOString(),
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("id", license.id)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      license: updated,
    });
  } catch (err: any) {
    console.error("RENEW ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
