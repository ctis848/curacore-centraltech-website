"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface RenewalAgg {
  totalAmount: number;
  count: number;
}

interface MonthData {
  month: string;
  total: number;
  count: number;
}

export default function RenewalAnalyticsPage() {
  const supabase = supabaseBrowser();

  const [agg, setAgg] = useState<RenewalAgg | null>(null);
  const [byMonth, setByMonth] = useState<MonthData[]>([]);
  const [forecast, setForecast] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [yearFilter, setYearFilter] = useState<string>("all");

  useEffect(() => {
    load();
  }, [yearFilter]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const { data: renewals, error: renewErr } = await supabase
        .from("RenewalHistory")
        .select("*");

      // ⭐ FINAL FIX: Only treat REAL Supabase errors as errors
      const isRealError =
        renewErr &&
        typeof renewErr === "object" &&
        renewErr !== null &&
        (
          "message" in renewErr ||
          "code" in renewErr ||
          "details" in renewErr ||
          "hint" in renewErr
        );

      if (isRealError) {
        console.error("Renewal analytics fetch error:", renewErr);
        setError("Unable to load analytics.");
        return;
      }

      if (!renewals || renewals.length === 0) {
        setError("No renewal analytics available.");
        return;
      }

      // Filter by year
      const filtered =
        yearFilter === "all"
          ? renewals
          : renewals.filter((r: any) => {
              if (!r.paidAt) return false;
              const d = new Date(r.paidAt);
              return d.getFullYear().toString() === yearFilter;
            });

      // Totals
      const amounts = filtered.map((r: any) => Number(r.amount) || 0);
      const totalAmount = amounts.reduce((a, b) => a + b, 0);
      const count = amounts.length;

      setAgg({ totalAmount, count });

      // Group by month
      const monthMap = new Map<string, { total: number; count: number }>();

      filtered.forEach((r: any) => {
        if (!r.paidAt) return;

        const d = new Date(r.paidAt);
        if (isNaN(d.getTime())) return;

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

        const prev = monthMap.get(key) || { total: 0, count: 0 };
        monthMap.set(key, {
          total: prev.total + Number(r.amount || 0),
          count: prev.count + 1,
        });
      });

      const monthArray = Array.from(monthMap.entries())
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([month, v]) => ({ month, ...v }));

      setByMonth(monthArray);

      // Forecasting
      generateForecast(monthArray);
    } catch (err) {
      console.error("Unexpected analytics error:", err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  // SIMPLE FORECASTING MODEL (Linear Regression)
  function generateForecast(months: MonthData[]) {
    if (months.length < 2) {
      setForecast([]);
      return;
    }

    const x = months.map((_, i) => i + 1);
    const yRevenue = months.map((m) => m.total);
    const yCount = months.map((m) => m.count);

    const nextX = months.length + 1;

    const predict = (x: number[], y: number[], nextX: number) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return Math.max(0, slope * nextX + intercept);
    };

    const forecastRevenue = predict(x, yRevenue, nextX);
    const forecastCount = predict(x, yCount, nextX);

    const nextMonth = getNextMonth(months[months.length - 1].month);

    setForecast([
      {
        month: nextMonth,
        total: Math.round(forecastRevenue),
        count: Math.round(forecastCount),
      },
    ]);
  }

  function getNextMonth(current: string) {
    const [year, month] = current.split("-");
    const d = new Date(Number(year), Number(month), 1);
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // CSV Export
  function exportCSV() {
    if (!byMonth.length) return;

    const headers = ["Month", "Revenue", "Count"];
    const rows = byMonth.map((m) => [m.month, m.total, m.count]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `renewal-analytics-${new Date().toISOString()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Renewal Analytics</h1>

        <div className="flex gap-3">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-slate-500">Loading analytics…</p>}

      {/* KPI CARDS */}
      {agg && !loading && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Renewal Revenue</p>
            <p className="text-2xl font-bold">₦{agg.totalAmount.toLocaleString()}</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Renewals</p>
            <p className="text-2xl font-bold">{agg.count}</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Average per Renewal</p>
            <p className="text-2xl font-bold">
              ₦
              {agg.count === 0
                ? "0"
                : Math.round(agg.totalAmount / agg.count).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* CHARTS */}
      {byMonth.length > 0 && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* BAR CHART */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Revenue by Month</h2>
            <Bar
              data={{
                labels: byMonth.map((m) => m.month),
                datasets: [
                  {
                    label: "Revenue (₦)",
                    data: byMonth.map((m) => m.total),
                    backgroundColor: "rgba(16, 185, 129, 0.6)",
                  },
                ],
              }}
            />
          </div>

          {/* LINE CHART */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Renewals Count by Month</h2>
            <Line
              data={{
                labels: byMonth.map((m) => m.month),
                datasets: [
                  {
                    label: "Renewals",
                    data: byMonth.map((m) => m.count),
                    borderColor: "rgba(59, 130, 246, 0.8)",
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                  },
                ],
              }}
            />
          </div>
        </div>
      )}

      {/* FORECAST SECTION */}
      {forecast.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-sm mb-6">
          <h2 className="font-semibold mb-3">Forecast (Next Month)</h2>

          <div className="flex justify-between text-sm">
            <span>{forecast[0].month}</span>
            <span>
              ₦{forecast[0].total.toLocaleString()} ({forecast[0].count} renewals)
            </span>
          </div>
        </div>
      )}

      {/* MONTH TABLE */}
      {byMonth.length > 0 && !loading && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Monthly Breakdown</h2>

          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Revenue</th>
                <th className="p-3 text-left">Renewals</th>
              </tr>
            </thead>

            <tbody>
              {byMonth.map((m) => (
                <tr key={m.month} className="border-b hover:bg-slate-50">
                  <td className="p-3">{m.month}</td>
                  <td className="p-3">₦{m.total.toLocaleString()}</td>
                  <td className="p-3">{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
