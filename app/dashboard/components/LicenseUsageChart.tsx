"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function LicenseUsageChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Machines Activated",
        data: [5, 9, 14, 20, 25, 32],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">License Usage</h2>
      <Line data={data} height={100} />
    </div>
  );
}
