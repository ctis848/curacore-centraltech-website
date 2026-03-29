// FILE: app/admin/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
  const supabase = supabaseServer();

  const [{ count: clients }, { count: licenses }, { count: pending }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("licenses").select("*", { count: "exact", head: true }),
      supabase
        .from("license_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "paid");

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

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
