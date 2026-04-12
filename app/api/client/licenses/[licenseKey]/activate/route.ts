import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  try {
    const { licenseKey } = await context.params;
    const body = await req.json();

    const { machine_id, machine_name, os_version, ip_address } = body;

    if (!machine_id) {
      return NextResponse.json(
        { error: "machine_id is required" },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       1. FETCH LICENSE
    ----------------------------------------- */
    const { data: license } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("license_key", licenseKey)
      .single();

    if (!license) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    /* -----------------------------------------
       2. AUTO‑STATUS ENGINE
    ----------------------------------------- */
    const now = new Date();
    let computedStatus = license.status;

    if (license.annual_fee_paid_until) {
      const paidUntil = new Date(license.annual_fee_paid_until);
      const graceEnd = new Date(paidUntil.getTime() + 7 * 86400000);

      if (now <= paidUntil) computedStatus = "ACTIVE";
      else if (now <= graceEnd) computedStatus = "GRACE";
      else computedStatus = "EXPIRED";
    }

    if (computedStatus === "EXPIRED") {
      return NextResponse.json(
        { error: "License expired" },
        { status: 403 }
      );
    }

    /* -----------------------------------------
       3. CHECK ACTIVATION LIMIT
    ----------------------------------------- */
    if (
      license.max_activations &&
      license.activation_count >= license.max_activations
    ) {
      return NextResponse.json(
        { error: "Activation limit reached" },
        { status: 403 }
      );
    }

    /* -----------------------------------------
       4. INSERT MACHINE ACTIVATION
    ----------------------------------------- */
    await supabaseAdmin.from("machine_activations").insert({
      license_id: license.id,
      machine_id,
      machine_name,
      os_version,
      ip_address,
      activated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    });

    /* -----------------------------------------
       5. INCREMENT ACTIVATION COUNT
    ----------------------------------------- */
    await supabaseAdmin
      .from("licenses")
      .update({
        activation_count: license.activation_count + 1,
        status: computedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    return NextResponse.json({
      success: true,
      status: computedStatus,
      message: "Machine activated successfully",
    });
  } catch (err: any) {
    console.error("ACTIVATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
