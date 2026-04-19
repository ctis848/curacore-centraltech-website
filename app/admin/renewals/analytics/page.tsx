"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface RenewalAgg {
  totalAmount: number;
  count: number;
}

export default function RenewalAnalyticsPage() {
  const supabase = supabaseBrowser();

  const [agg, setAgg] = useState<RenewalAgg | null>(null);
  const [byMonth, setByMonth] = useState<
    { month: string; total: number; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        //
        // 1. LOAD ALL RENEWALS SAFELY
        //
        const { data: renewals, error: renewErr } = await supabase
          .from("RenewalHistory")
          .select("*"); // IMPORTANT: never select single columns under RLS

        if (renewErr || !renewals) {
          console.error("Renewal analytics fetch error:", renewErr);
          setError("Unable to load analytics.");
          return;
        }

        //
        // 2. TOTALS
        //
        const amounts = renewals.map((r: any) => Number(r.amount) || 0);
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const count = amounts.length;

        setAgg({ totalAmount, count });

        //
        // 3. GROUP BY MONTH
        //
        const monthMap = new Map<string, { total: number; count: number }>();

        renewals.forEach((r: any) => {
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
      } catch (err) {
        console.error("Unexpected analytics error:", err);
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Renewal Analytics</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-slate-500">Loading analytics…</p>}

      {/* TOTALS */}
      {agg && !loading && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Renewal Revenue</p>
            <p className="text-2xl font-bold">
              ₦{agg.totalAmount.toLocaleString()}
            </p>
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

      {/* BY MONTH */}
      {byMonth.length > 0 && !loading && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-3">By Month</h2>

          <div className="space-y-2">
            {byMonth.map((m) => (
              <div
                key={m.month}
                className="flex items-center justify-between text-sm"
              >
                <span>{m.month}</span>
                <span>
                  ₦{m.total.toLocaleString()} ({m.count} renewals)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
