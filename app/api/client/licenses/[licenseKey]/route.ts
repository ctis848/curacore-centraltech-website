import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { supabase } from "@/lib/supabase/supabaseClient";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  try {
    const { licenseKey } = await context.params;

    /* -----------------------------------------
       1. AUTHENTICATE CLIENT (Supabase Auth)
    ----------------------------------------- */
    const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(accessToken);

    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    /* -----------------------------------------
       2. RESOLVE CLIENT FROM AUTH USER
    ----------------------------------------- */
    const { data: client, error: clientErr } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    /* -----------------------------------------
       3. FETCH LICENSE (must belong to client)
    ----------------------------------------- */
    const { data: license, error: licErr } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("license_key", licenseKey)
      .eq("client_id", client.id)
      .single();

    if (licErr || !license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    /* -----------------------------------------
       4. AUTO‑STATUS CHECK
    ----------------------------------------- */
    let computedStatus = license.status;
    const now = new Date();

    if (license.annual_fee_paid_until) {
      const paidUntil = new Date(license.annual_fee_paid_until);
      const graceEnd = new Date(paidUntil.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (now <= paidUntil) computedStatus = "ACTIVE";
      else if (now <= graceEnd) computedStatus = "GRACE";
      else computedStatus = "EXPIRED";
    }

    /* -----------------------------------------
       5. UPDATE STATUS IF CHANGED
    ----------------------------------------- */
    if (computedStatus !== license.status) {
      await supabaseAdmin
        .from("licenses")
        .update({
          status: computedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", license.id);
    }

    /* -----------------------------------------
       6. FETCH MACHINE ACTIVATION HISTORY
    ----------------------------------------- */
    const { data: activations, error: actErr } = await supabaseAdmin
      .from("machine_activations")
      .select("*")
      .eq("license_id", license.id)
      .order("activated_at", { ascending: false });

    if (actErr) {
      return NextResponse.json(
        { error: "Failed to load activation history" },
        { status: 500 }
      );
    }

    /* -----------------------------------------
       7. RETURN CLEAN RESPONSE
    ----------------------------------------- */
    return NextResponse.json({
      success: true,
      license: {
        id: license.id,
        product_name: license.product_name,
        license_key: license.license_key,
        status: computedStatus,
        expires_at: license.expires_at,
        activation_count: license.activation_count,
        max_activations: license.max_activations,
        annual_fee_percent: license.annual_fee_percent,
        annual_fee_paid_until: license.annual_fee_paid_until,
        created_at: license.created_at,
        updated_at: license.updated_at,
      },
      history: activations || [],
    });
  } catch (err: any) {
    console.error("LICENSE DETAILS SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
