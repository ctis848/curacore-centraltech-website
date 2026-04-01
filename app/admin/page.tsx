// FILE: app/admin/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
  const supabase = supabaseServer();

  // Fetch counts in parallel
  const [
    clientsRes,
    licensesRes,
    pendingRes,
    validationsRes,
    activationsRes,
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

  const clients = clientsRes.count ?? 0;
  const licenses = licensesRes.count ?? 0;
  const pending = pendingRes.count ?? 0;
  const validations = validationsRes.count ?? 0;
  const activations = activationsRes.count ?? 0;

  // Fetch payments safely
  const paymentsRes = await supabase
    .from("payments")
    .select("amount, type, created_at, paid_at")
    .eq("status", "paid");

  const payments = Array.isArray(paymentsRes.data)
    ? paymentsRes.data
    : [];

  // Revenue totals (safe)
  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p?.amount ?? 0),
    0
  );

  const annualFeeRevenue = payments
    .filter((p) => p?.type === "annual_fee")
    .reduce((sum, p) => sum + Number(p?.amount ?? 0), 0);

  const licenseSalesRevenue = payments
    .filter((p) => p?.type === "license_purchase")
    .reduce((sum, p) => sum + Number(p?.amount ?? 0), 0);

  // License health score
  const licenseHealthRes = await supabase
    .from("licenses")
    .select("status, expires_at, max_activations, activation_count");

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
        <StatCard title="Clients" value={clients} />
        <StatCard title="Licenses" value={licenses} />
        <StatCard title="Pending Requests" value={pending} />
        <StatCard
          title="Total Revenue"
          value={"₦" + totalRevenue.toLocaleString()}
        />
      </div>

      {/* ADVANCED METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Validations" value={validations} />
        <StatCard title="Activations" value={activations} />
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
        <StatCard title="Average License Health" value={avgHealth + "%"} />
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Revenue (Last 12 Months)
        </h2>
        <RevenueChart payments={payments} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
  );
}
