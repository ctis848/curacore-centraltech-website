"use client";

import { useEffect, useState } from "react";

type RevenueResponse = {
  totalRevenue?: number;
  currency?: string;
  byProduct?: Record<string, number>;
  recentPayments?: any[];
  error?: string; // <-- added so TypeScript stops complaining
};

export default function RevenueInsightsPage() {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/revenue-insights");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to load revenue insights", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Revenue Insights</h1>
        <p>Loading revenue data...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Revenue Insights</h1>
        <p className="text-red-600">Failed to load revenue insights.</p>
      </div>
    );
  }

  const { totalRevenue, currency, byProduct, recentPayments } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Revenue Insights</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Total Revenue</h2>
          <p className="text-2xl font-bold">
            {currency} {totalRevenue?.toLocaleString()}
          </p>
        </div>

        <div className="border rounded-lg p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Revenue by Product</h2>
          {byProduct && Object.keys(byProduct).length === 0 && <p>No revenue yet.</p>}
          {byProduct &&
            Object.entries(byProduct).map(([product, amount]) => (
              <div key={product} className="flex justify-between text-sm py-1">
                <span>{product}</span>
                <span>
                  {currency} {amount.toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Recent Payments</h2>
        {!recentPayments || recentPayments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.product_name || "Unknown"}</td>
                  <td className="p-2">
                    {p.currency} {p.amount?.toLocaleString()}
                  </td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
