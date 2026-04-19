"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function DashboardChart({
  active,
  total,
}: {
  active: number;
  total: number;
}) {
  const expired = Math.max(total - active, 0);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold mb-3 text-slate-800">
        License Overview
      </h2>
      <Bar
        data={{
          labels: ["Active", "Expired"],
          datasets: [
            {
              label: "Licenses",
              data: [active, expired],
              backgroundColor: ["#3b82f6", "#ef4444"],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  );
}
