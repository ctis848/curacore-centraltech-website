"use client";

import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function ServiceAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/service-analytics/stats", {
        credentials: "include",
      });

      const json = await res.json();
      setStats(json);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-20 text-center">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Service Analytics
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="font-bold mb-4">Request Overview</h2>
            <Bar
              data={{
                labels: ["Total Requests", "Pending Requests"],
                datasets: [
                  {
                    label: "Requests",
                    data: [stats.totalRequests, stats.pendingRequests],
                    backgroundColor: ["#6366f1", "#f59e0b"],
                  },
                ],
              }}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="font-bold mb-4">Invoice Payments</h2>
            <Doughnut
              data={{
                labels: ["Paid", "Unpaid"],
                datasets: [
                  {
                    data: [stats.paidInvoices, stats.totalRequests - stats.paidInvoices],
                    backgroundColor: ["#10b981", "#ef4444"],
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
