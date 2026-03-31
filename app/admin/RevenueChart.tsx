"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueChart({ payments }: { payments: any[] }) {
  // Generate last 12 months labels
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toLocaleString("default", { month: "short" });
  });

  // Compute revenue per month
  const dataByMonth = months.map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));

    const month = d.getMonth();
    const year = d.getFullYear();

    return payments
      .filter((p) => {
        const pd = new Date(p.paid_at || p.created_at);
        return pd.getMonth() === month && pd.getFullYear() === year;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
  });

  // Chart.js dataset
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Revenue",
        data: dataByMonth,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#1d4ed8",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `₦${Number(ctx.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `₦${value.toLocaleString()}`,
        },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
}
