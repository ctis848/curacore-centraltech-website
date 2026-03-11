export const dynamic = "force-dynamic";
export const revalidate = 0;

import AnalyticsSummary from "./components/AnalyticsSummary";

async function getLicenses() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/licenses`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const { licenses } = await res.json();
  return licenses;
}

async function getStats() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/license-analytics`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminRenewalsPage() {
  const [licenses, stats] = await Promise.all([getLicenses(), getStats()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Renewal Management</h1>

      {stats && <AnalyticsSummary stats={stats} />}

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">License ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Renewal Due</th>
              <th className="p-2 border">Service Fee Paid</th>
              <th className="p-2 border">Auto‑Renew</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l: any) => (
              <tr key={l.id}>
                <td className="p-2 border">{l.id}</td>
                <td className="p-2 border">{l.user_id}</td>
                <td className="p-2 border">{l.plan}</td>
                <td className="p-2 border">
                  {l.renewal_due_date
                    ? new Date(l.renewal_due_date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2 border">{l.service_fee_paid ? "Yes" : "No"}</td>
                <td className="p-2 border">{l.auto_renew ? "On" : "Off"}</td>
                <td className="p-2 border">
                  {!l.is_active
                    ? "Inactive"
                    : l.auto_revoked
                    ? "Auto‑Revoked"
                    : "Active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
