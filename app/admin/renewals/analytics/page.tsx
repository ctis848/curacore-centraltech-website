"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  expiresAt: string | null;
  clientId: string | null;
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
        clientId: r.clientId ?? null,
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
    <div className="p-6 space-y-8 max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renewal Analytics
      </h1>

      {/* HEADER FILTER */}
      <div className="flex justify-between items-center">
        <div></div>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
        >
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow-xl rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Total Renewals</p>
          <p className="text-3xl font-extrabold text-slate-800">{summary.total}</p>
        </div>

        <div className="p-6 bg-white shadow-xl rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Due Soon</p>
          <p className="text-3xl font-extrabold text-yellow-600">{summary.dueSoon}</p>
        </div>

        <div className="p-6 bg-white shadow-xl rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Expired</p>
          <p className="text-3xl font-extrabold text-red-600">{summary.expired}</p>
        </div>
      </div>

      {/* MONTH TABLE */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-slate-200 mt-8">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
            <tr className="border-b text-slate-700">
              <th className="p-4 text-left font-semibold">Month</th>
              <th className="p-4 text-left font-semibold">Total Renewals</th>
              <th className="p-4 text-left font-semibold">Due Soon</th>
              <th className="p-4 text-left font-semibold">Expired</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(monthlyData).map(([month, stats]) => (
              <tr
                key={month}
                className="border-b hover:bg-slate-50 transition even:bg-slate-50/30"
              >
                <td className="p-4 font-medium">{month}</td>
                <td className="p-4">{stats.total}</td>
                <td className="p-4 text-yellow-700">{stats.dueSoon}</td>
                <td className="p-4 text-red-700">{stats.expired}</td>
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
