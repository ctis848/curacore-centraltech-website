import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Basic counts
    const [
      clientsRes,
      licensesRes,
      pendingRes,
      validationsRes,
      activationsRes,
      paymentsRes,
      licenseHealthRes,
    ] = await Promise.all([
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("licenses").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("license_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "PENDING"),
      supabaseAdmin
        .from("license_validation_logs")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("license_activations")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("payments")
        .select("amount, type, status, created_at, paid_at")
        .eq("status", "paid"),
      supabaseAdmin
        .from("licenses")
        .select("status, expires_at, max_activations, activation_count"),
    ]);

    const clients = clientsRes.count ?? 0;
    const licenses = licensesRes.count ?? 0;
    const pending = pendingRes.count ?? 0;
    const validations = validationsRes.count ?? 0;
    const activations = activationsRes.count ?? 0;

    const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

    const totalRevenue = payments.reduce(
      (sum, p: any) => sum + Number(p?.amount ?? 0),
      0
    );

    const annualFeeRevenue = payments
      .filter((p: any) => p?.type === "annual_fee")
      .reduce((sum, p: any) => sum + Number(p?.amount ?? 0), 0);

    const licenseSalesRevenue = payments
      .filter((p: any) => p?.type === "license_purchase")
      .reduce((sum, p: any) => sum + Number(p?.amount ?? 0), 0);

    const licenseHealthData = Array.isArray(licenseHealthRes.data)
      ? licenseHealthRes.data
      : [];

    function computeHealth(license: any) {
      if (!license) return 0;

      let score = 100;

      if (license.status === "revoked") score = 0;
      else if (license.status === "expired") score = 20;

      const daysLeft = license.expires_at
        ? (new Date(license.expires_at).getTime() - Date.now()) / 86400000
        : 999;

      if (daysLeft < 7) score -= 20;
      if (daysLeft < 1) score -= 40;

      if (
        Number(license.activation_count ?? 0) >
        Number(license.max_activations ?? 0)
      ) {
        score -= 40;
      }

      return Math.max(0, score);
    }

    const avgHealth =
      licenseHealthData.length > 0
        ? Math.round(
            licenseHealthData.reduce(
              (sum: number, l: any) => sum + computeHealth(l),
              0
            ) / licenseHealthData.length
          )
        : 100;

    return NextResponse.json({
      clients,
      licenses,
      pending,
      validations,
      activations,
      totalRevenue,
      annualFeeRevenue,
      licenseSalesRevenue,
      avgHealth,
      payments,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load analytics", details: err.message },
      { status: 500 }
    );
  }
}
