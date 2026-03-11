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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

export default function LicenseRenewalChart({ data }: { data: any[] }) {
  const labels = data?.map((d) => d.month) || [];
  const values = data?.map((d) => d.count) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Renewals / Activations",
        data: values,
        borderColor: "#f59e0b",
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.4)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#f59e0b",
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#64748b" },
        grid: { color: "rgba(100, 116, 139, 0.1)" },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
