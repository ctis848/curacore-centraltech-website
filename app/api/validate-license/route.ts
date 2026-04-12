// FILE: app/api/validate-license/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type ValidateBody = {
  licenseKey: string;
  deviceId?: string;
  appVersion?: string;
  os?: string;
};

export async function POST(req: Request) {
  const { licenseKey, deviceId, appVersion, os }: ValidateBody = await req.json();
  const ip = req.headers.get("x-forwarded-for") || null;

  const supabase = supabaseServer();

  // Helper: log validation attempts
  async function log(result: string, licenseId: string | null = null) {
    await supabase.from("license_validation_logs").insert({
      license_id: licenseId,
      device_id: deviceId || null,
      ip_address: ip,
      app_version: appVersion || null,
      os: os || null,
      result,
    });
  }

  // 1) Missing key
  if (!licenseKey) {
    await log("MISSING_LICENSE_KEY");
    return NextResponse.json(
      { valid: false, reason: "MISSING_LICENSE_KEY" },
      { status: 400 }
    );
  }

  // 2) Fetch license
  const { data: license, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", licenseKey)
    .single();

  if (error || !license) {
    await log("NOT_FOUND");
    return NextResponse.json(
      { valid: false, reason: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // 3) Revoked
  if (license.status === "revoked") {
    await log("REVOKED", license.id);
    return NextResponse.json(
      { valid: false, reason: "REVOKED" },
      { status: 403 }
    );
  }

  const now = new Date();

  // 4) Expired
  if (license.expires_at && new Date(license.expires_at) < now) {
    if (license.status !== "expired") {
      await supabase
        .from("licenses")
        .update({ status: "expired" })
        .eq("id", license.id);
    }

    await log("EXPIRED", license.id);
    return NextResponse.json(
      { valid: false, reason: "EXPIRED" },
      { status: 403 }
    );
  }

  // 5) Annual fee unpaid → revoke
  if (
    license.annual_fee_paid_until &&
    new Date(license.annual_fee_paid_until) < now
  ) {
    await supabase
      .from("licenses")
      .update({ status: "revoked" })
      .eq("id", license.id);

    await log("ANNUAL_FEE_UNPAID_REVOKED", license.id);
    return NextResponse.json(
      { valid: false, reason: "ANNUAL_FEE_UNPAID_REVOKED" },
      { status: 403 }
    );
  }

  // 6) Device activation tracking
  if (deviceId) {
    // Count activations
    const { count } = await supabase
      .from("license_activations")
      .select("id", { count: "exact", head: true })
      .eq("license_id", license.id);

    // Enforce activation limit
    if (
      typeof count === "number" &&
      license.max_activations &&
      count >= license.max_activations
    ) {
      await log("MAX_ACTIVATIONS_REACHED", license.id);
      return NextResponse.json(
        { valid: false, reason: "MAX_ACTIVATIONS_REACHED" },
        { status: 403 }
      );
    }

    // Check if this device is already activated
    const { data: existingActivation } = await supabase
      .from("license_activations")
      .select("id")
      .eq("license_id", license.id)
      .eq("device_id", deviceId)
      .maybeSingle();

    // Register new activation
    if (!existingActivation) {
      await supabase.from("license_activations").insert({
        license_id: license.id,
        device_id: deviceId,
      });

      // Update activation count
      await supabase
        .from("licenses")
        .update({
          activated_at: license.activated_at || new Date().toISOString(),
          activation_count: (license.activation_count || 0) + 1,
        })
        .eq("id", license.id);
    }
  }

  // 7) VALID LICENSE → log success
  await log("OK", license.id);

  return NextResponse.json({
    valid: true,
    reason: "OK",
    status: license.status,
    expires_at: license.expires_at,
    annual_fee_paid_until: license.annual_fee_paid_until,
    activation_count: license.activation_count,
    max_activations: license.max_activations,
  });
}
