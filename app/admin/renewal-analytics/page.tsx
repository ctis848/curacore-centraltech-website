"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------
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

// -----------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------
export default function RenewalAnalyticsPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("All Years");

  // -----------------------------------------------------
  // LOAD LICENSE DATA
  // -----------------------------------------------------
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

      const formatted: LicenseRow[] = (data || []).map((r: any) => ({
        id: r.id,
        productName: r.productName ?? null,
        licenseKey: r.licenseKey,
        expiresAt: r.expires_at ?? null,
        clientId: r.clientId ?? null,
        userId: r.user_id ?? null,
        status: r.status,
        createdAt: r.created_at,
      }));

      setLicenses(formatted);
      setLoading(false);
    }

    load();
  }, [supabase]);

  // -----------------------------------------------------
  // AVAILABLE YEARS
  // -----------------------------------------------------
  const years = useMemo(() => {
    const set = new Set<string>();

    licenses.forEach((lic) => {
      if (lic.expiresAt) {
        set.add(new Date(lic.expiresAt).getFullYear().toString());
      }
    });

    return ["All Years", ...Array.from(set).sort()];
  }, [licenses]);

  // -----------------------------------------------------
  // FILTER BY YEAR
  // -----------------------------------------------------
  const filteredLicenses = useMemo(() => {
    if (year === "All Years") return licenses;

    return licenses.filter((lic) => {
      if (!lic.expiresAt) return false;
      return new Date(lic.expiresAt).getFullYear().toString() === year;
    });
  }, [licenses, year]);

  // -----------------------------------------------------
  // MONTHLY ANALYTICS
  // -----------------------------------------------------
  const monthlyData = useMemo(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const map: Record<
      string,
      { total: number; dueSoon: number; expired: number }
    > = {};

    months.forEach((m) => {
      map[m] = { total: 0, dueSoon: 0, expired: 0 };
    });

    filteredLicenses.forEach((lic) => {
      if (!lic.expiresAt) return;

      const exp = new Date(lic.expiresAt);
      const month = months[exp.getMonth()];

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

  // -----------------------------------------------------
  // SUMMARY TOTALS
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renewal Analytics
      </h1>

      {/* YEAR FILTER */}
      <div className="flex justify-end">
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
        <SummaryCard
          title="Total Renewals"
          value={summary.total}
          color="slate"
        />
        <SummaryCard
          title="Due Soon (≤ 30 days)"
          value={summary.dueSoon}
          color="yellow"
        />
        <SummaryCard
          title="Expired"
          value={summary.expired}
          color="red"
        />
      </div>

      {/* MONTHLY TABLE */}
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

// -----------------------------------------------------
// SUMMARY CARD COMPONENT
// -----------------------------------------------------
function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "slate" | "yellow" | "red";
}) {
  const colors = {
    slate: "text-slate-800",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-3xl font-extrabold ${colors[color]}`}>{value}</p>
    </div>
  );
}
