export default function AnalyticsSummary({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Active Licenses" value={stats.active} />
      <StatCard label="Auto‑Revoked" value={stats.auto_revoked} />
      <StatCard label="Upcoming Renewals (30d)" value={stats.upcoming_renewals} />
      <StatCard label="Renewals This Month" value={stats.renewals_this_month} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
