"use client";

import { useEffect, useState } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

type License = {
  id: string;
  licenseKey: string;
  productName: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  activatedAt: string | null;
};

export default function ActiveLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/licenses", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load licenses");
          setLoading(false);
          return;
        }

        const active = (data.licenses || []).filter(
          (l: License) => l.status === "ACTIVE"
        );

        setLicenses(active);
        setLoading(false);
      } catch {
        setError("Network error");
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <DashboardClient>
        <p className="p-6">Loading active licenses...</p>
      </DashboardClient>
    );
  }

  if (error) {
    return (
      <DashboardClient>
        <p className="p-6 text-red-600">{error}</p>
      </DashboardClient>
    );
  }

  return (
    <DashboardClient>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Active Licenses</h1>

        {licenses.length === 0 ? (
          <p className="text-slate-500">No active licenses.</p>
        ) : (
          <ul className="space-y-3">
            {licenses.map((lic) => (
              <li
                key={lic.id}
                className="border rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow"
              >
                <div>
                  <p className="font-semibold">{lic.productName}</p>
                  <p className="font-mono text-xs text-slate-500">
                    {lic.licenseKey}
                  </p>
                </div>

                <p className="text-xs text-slate-500 mt-2 md:mt-0">
                  Activated:{" "}
                  {lic.activatedAt
                    ? new Date(lic.activatedAt).toLocaleString()
                    : "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardClient>
  );
}
