"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  expiresAt: string | null;
  tenantId: string | null;
  userId: string | null;
  status: string;
  createdAt: string;
}

export default function RenewalAnalyticsPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("All Years");

  // Load licenses
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("License")
        .select("*")
        .order("expires_at", { ascending: true });

      if (error) {
        console.error("Analytics fetch error:", error);
        setLoading(false);
        return;
      }

      const list: LicenseRow[] = (data || []).map((r: any) => ({
        id: r.id,
        productName: r.productName ?? null,
        licenseKey: r.licenseKey,
        expiresAt: r.expires_at ?? null,
        tenantId: r.user_id ?? null,
        userId: r.user_id ?? null,
        status: r.status,
        createdAt: r.created_at,
      }));

      setLicenses(list);
      setLoading(false);
    }

    load();
  }, [supabase]);

  // Extract available years
  const years = useMemo(() => {
    const set = new Set<string>();

    licenses.forEach((lic) => {
      if (lic.expiresAt) {
        const y = new Date(lic.expiresAt).getFullYear().toString();
        set.add(y);
      }
    });

    return ["All Years", ...Array.from(set)];
  }, [licenses]);

  // Filter by year
  const filteredLicenses = useMemo(() => {
    if (year === "All Years") return licenses;

    return licenses.filter((lic) => {
      if (!lic.expiresAt) return false;
      return new Date(lic.expiresAt).getFullYear().toString() === year;
    });
  }, [licenses, year]);

  // Monthly analytics
  const monthlyData = useMemo(() => {
    const map: Record<
      string,
      { total: number; dueSoon: number; expired: number }
    > = {};

    filteredLicenses.forEach((lic) => {
      if (!lic.expiresAt) return;

      const exp = new Date(lic.expiresAt);
      const month = exp.toLocaleString("default", { month: "long" });

      if (!map[month]) {
        map[month] = { total: 0, dueSoon: 0, expired: 0 };
      }

      map[month].total++;

      const now = new Date();
      const diff = exp.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days > 0 && days <= 30) {
        map[month].dueSoon++;
      } else if (days < 0) {
        map[month].expired++;
      }
    });

    return map;
  }, [filteredLicenses]);

  // Summary totals
  const summary = useMemo(() => {
    let total = 0;
    let dueSoon = 0;
    let expired = 0;

    Object.values(monthlyData).forEach((m) => {
      total += m.total;
      dueSoon += m.dueSoon;
      expired += m.expired;
    });

    return { total, dueSoon, expired };
  }, [monthlyData]);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Renewal Analytics</h1>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded border">
          <p className="text-sm text-slate-500">Total Renewals</p>
          <p className="text-2xl font-semibold">{summary.total}</p>
        </div>

        <div className="p-4 bg-white shadow rounded border">
          <p className="text-sm text-slate-500">Due Soon</p>
          <p className="text-2xl font-semibold text-yellow-700">
            {summary.dueSoon}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded border">
          <p className="text-sm text-slate-500">Expired</p>
          <p className="text-2xl font-semibold text-red-700">
            {summary.expired}
          </p>
        </div>
      </div>

      {/* MONTH TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded border border-slate-200 mt-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b text-slate-700">
              <th className="p-3 text-left">Month</th>
              <th className="p-3 text-left">Total Renewals</th>
              <th className="p-3 text-left">Due Soon</th>
              <th className="p-3 text-left">Expired</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(monthlyData).map(([month, stats]) => (
              <tr key={month} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{month}</td>
                <td className="p-3">{stats.total}</td>
                <td className="p-3 text-yellow-700">{stats.dueSoon}</td>
                <td className="p-3 text-red-700">{stats.expired}</td>
              </tr>
            ))}

            {Object.keys(monthlyData).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  No renewal analytics available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
