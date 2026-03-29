// FILE: app/admin/RevenueChart.tsx
"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function RevenueChart({ payments }: { payments: any[] }) {
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toLocaleString("default", { month: "short" });
  });

  const dataByMonth = months.map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));

    const month = d.getMonth();
    const year = d.getFullYear();

    return payments
      .filter((p) => {
        const pd = new Date(p.paid_at);
        return pd.getMonth() === month && pd.getFullYear() === year;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
  });

  return (
    <Line
      data={{
        labels: months,
        datasets: [
          {
            label: "Revenue",
            data: dataByMonth,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.3)",
          },
        ],
      }}
    />
  );
}
