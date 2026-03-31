// FILE: app/admin/license-analytics/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";

export default async function LicenseAnalyticsPage() {
  const supabase = supabaseServer();

  // Fetch all licenses
  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, status, activated_at, expires_at, activation_count");

  // Fetch activation logs
  const { data: activations } = await supabase
    .from("license_activations")
    .select("id, activated_at");

  // Fetch validation logs
  const { data: validations } = await supabase
    .from("license_validation_logs")
    .select("id, result, created_at");

  // Fetch payments (for revenue analytics)
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, type, created_at");

  // Basic license counts
  const totalLicenses = licenses?.length || 0;
  const activeLicenses = licenses?.filter((l) => l.status === "active").length || 0;
  const expiredLicenses = licenses?.filter((l) => l.status === "expired").length || 0;
  const revokedLicenses = licenses?.filter((l) => l.status === "revoked").length || 0;

  // Total activations
  const totalActivations = activations?.length || 0;

  // Total validations
  const totalValidations = validations?.length || 0;

  // Revenue analytics
  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const annualFeeRevenue =
    payments
      ?.filter((p) => p.type === "annual_fee")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const licenseSalesRevenue =
    payments
      ?.filter((p) => p.type === "license_purchase")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Activations per day (last 7 days)
  const activationsPerDay: Record<string, number> = {};
  activations?.forEach((a) => {
    const day = new Date(a.activated_at).toISOString().split("T")[0];
    activationsPerDay[day] = (activationsPerDay[day] || 0) + 1;
  });

  // Validations per day (last 7 days)
  const validationsPerDay: Record<string, number> = {};
  validations?.forEach((v) => {
    const day = new Date(v.created_at).toISOString().split("T")[0];
    validationsPerDay[day] = (validationsPerDay[day] || 0) + 1;
  });

  // Revenue per day (last 7 days)
  const revenuePerDay: Record<string, number> = {};
  payments?.forEach((p) => {
    const day = new Date(p.created_at).toISOString().split("T")[0];
    revenuePerDay[day] = (revenuePerDay[day] || 0) + Number(p.amount);
  });

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">License Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Licenses" value={totalLicenses} color="bg-blue-600" />
        <Card title="Active" value={activeLicenses} color="bg-green-600" />
        <Card title="Expired" value={expiredLicenses} color="bg-yellow-600" />
        <Card title="Revoked" value={revokedLicenses} color="bg-red-600" />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Revenue" value={`$${totalRevenue}`} color="bg-purple-700" />
        <Card title="Annual Fees" value={`$${annualFeeRevenue}`} color="bg-indigo-600" />
        <Card title="License Sales" value={`$${licenseSalesRevenue}`} color="bg-amber-600" />
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Activations" value={totalActivations} color="bg-teal-600" />
        <Card title="Total Validations" value={totalValidations} color="bg-cyan-600" />
        <Card title="Validation Success Rate"
          value={
            totalValidations > 0
              ? `${Math.round(
                  (((validations ?? []).filter((v) => v.result === "OK").length) /
                    totalValidations) *
                    100
                )}%`
              : "0%"
          }
          color="bg-lime-600"
        />
      </div>

      {/* Activations per day */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Daily Activity (Last 7 Days)</h2>

        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Activations</th>
              <th className="p-2">Validations</th>
              <th className="p-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {last7Days.map((day) => (
              <tr key={day} className="border-t">
                <td className="p-2">{day}</td>
                <td className="p-2">{activationsPerDay[day] || 0}</td>
                <td className="p-2">{validationsPerDay[day] || 0}</td>
                <td className="p-2">${revenuePerDay[day] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable Card Component
function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className={`${color} text-white rounded-lg p-4 shadow`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
