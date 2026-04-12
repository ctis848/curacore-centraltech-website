import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(
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

    /* AUTO‑STATUS ENGINE */
    const now = new Date();
    let computedStatus = license.status;

    if (license.annual_fee_paid_until) {
      const paidUntil = new Date(license.annual_fee_paid_until);
      const graceEnd = new Date(paidUntil.getTime() + 7 * 86400000);

      if (now <= paidUntil) computedStatus = "ACTIVE";
      else if (now <= graceEnd) computedStatus = "GRACE";
      else computedStatus = "EXPIRED";
    }

    /* UPDATE STATUS IF CHANGED */
    if (computedStatus !== license.status) {
      await supabaseAdmin
        .from("licenses")
        .update({
          status: computedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", license.id);
    }

    return NextResponse.json({
      success: true,
      license: {
        product_name: license.product_name,
        license_key: license.license_key,
        status: computedStatus,
        expires_at: license.expires_at,
        activation_count: license.activation_count,
        max_activations: license.max_activations,
        annual_fee_paid_until: license.annual_fee_paid_until,
      },
    });
  } catch (err: any) {
    console.error("VALIDATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
