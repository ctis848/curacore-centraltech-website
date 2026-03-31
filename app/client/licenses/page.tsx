"use client";

import { useEffect, useState } from "react";

type License = {
  id: string;
  key: string;
  productName: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/licenses")
      .then((r) => r.json())
      .then((data) => {
        const normalized = data.map((lic: any) => ({
          id: lic.id,
          key: lic.license_key,
          productName: lic.product_name ?? "Product",
          status: computeStatus(lic),
          activatedAt: lic.activated_at,
          expiresAt: lic.expires_at,
          createdAt: lic.created_at,
        }));

        setLicenses(normalized);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Licenses</h1>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : licenses.length === 0 ? (
        <p className="text-slate-500">No licenses found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900/40">
              <tr>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Activated</th>
                <th className="px-4 py-2 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => (
                <tr key={lic.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{lic.key}</td>
                  <td className="px-4 py-2">{lic.productName}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={lic.status} />
                  </td>
                  <td className="px-4 py-2">
                    {lic.activatedAt
                      ? new Date(lic.activatedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {lic.expiresAt
                      ? new Date(lic.expiresAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function computeStatus(lic: any): "PENDING" | "ACTIVE" | "EXPIRED" {
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
    return "EXPIRED";
  }
  if (lic.activated_at) {
    return "ACTIVE";
  }
  return "PENDING";
}

function StatusBadge({ status }: { status: License["status"] }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    EXPIRED: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}
