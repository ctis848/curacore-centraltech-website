// FILE: app/admin/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
  const supabase = supabaseServer();

  // Fetch counts
  const [
    { count: clients },
    { count: licenses },
    { count: pending },
    { count: validations },
    { count: activations }
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("licenses").select("*", { count: "exact", head: true }),
    supabase
      .from("license_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("license_validation_logs")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("license_activations")
      .select("*", { count: "exact", head: true }),
  ]);

  // Fetch payments
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, type, created_at, paid_at")
    .eq("status", "paid");

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Revenue breakdown
  const annualFeeRevenue =
    payments
      ?.filter((p) => p.type === "annual_fee")
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const licenseSalesRevenue =
    payments
      ?.filter((p) => p.type === "license_purchase")
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Compute average license health score
  const { data: licenseHealthData } = await supabase
    .from("licenses")
    .select("status, expires_at, max_activations, activation_count");

  function computeHealth(license: any) {
    let score = 100;

    if (license.status === "revoked") score = 0;
    else if (license.status === "expired") score = 20;

    const daysLeft =
      license.expires_at
        ? (new Date(license.expires_at).getTime() - Date.now()) / 86400000
        : 999;

    if (daysLeft < 7) score -= 20;
    if (daysLeft < 1) score -= 40;

    if (license.activation_count > license.max_activations) score -= 40;

    return Math.max(0, score);
  }

  const avgHealth =
    licenseHealthData && licenseHealthData.length > 0
      ? Math.round(
          licenseHealthData.reduce(
            (sum, l) => sum + computeHealth(l),
            0
          ) / licenseHealthData.length
        )
      : 100;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clients" value={clients ?? 0} />
        <StatCard title="Licenses" value={licenses ?? 0} />
        <StatCard title="Pending Requests" value={pending ?? 0} />
        <StatCard
          title="Total Revenue"
          value={"₦" + totalRevenue.toLocaleString()}
        />
      </div>

      {/* ADVANCED METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Validations" value={validations ?? 0} />
        <StatCard title="Activations" value={activations ?? 0} />
        <StatCard
          title="Annual Fee Revenue"
          value={"₦" + annualFeeRevenue.toLocaleString()}
        />
        <StatCard
          title="License Sales Revenue"
          value={"₦" + licenseSalesRevenue.toLocaleString()}
        />
      </div>

      {/* HEALTH SCORE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average License Health"
          value={avgHealth + "%"}
        />
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Revenue (Last 12 Months)</h2>
        <RevenueChart payments={payments || []} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
