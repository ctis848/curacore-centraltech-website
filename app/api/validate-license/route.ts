// FILE: app/api/validate-license/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type ValidateBody = {
  licenseKey: string;
  deviceId?: string;
};

export async function POST(req: Request) {
  const { licenseKey, deviceId }: ValidateBody = await req.json();
  const ip = req.headers.get("x-forwarded-for") || null;

  const supabase = supabaseServer();

  // Helper: log validation
  async function log(result: string, licenseId: string | null = null) {
    await supabase.from("license_validation_logs").insert({
      license_id: licenseId,
      device_id: deviceId || null,
      ip_address: ip,
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

  // 2) Find license
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

  // 4) Expired
  const now = new Date();

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

  // 6) Activation tracking + limit
  if (deviceId) {
    const { count } = await supabase
      .from("license_activations")
      .select("id", { count: "exact", head: true })
      .eq("license_id", license.id);

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

    const { data: existingActivation } = await supabase
      .from("license_activations")
      .select("id")
      .eq("license_id", license.id)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (!existingActivation) {
      await supabase.from("license_activations").insert({
        license_id: license.id,
        device_id: deviceId,
      });

      if (!license.activated_at) {
        await supabase
          .from("licenses")
          .update({
            activated_at: new Date().toISOString(),
            activation_count: (license.activation_count || 0) + 1,
          })
          .eq("id", license.id);
      } else {
        await supabase
          .from("licenses")
          .update({
            activation_count: (license.activation_count || 0) + 1,
          })
          .eq("id", license.id);
      }
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
  });
}
