"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function MachineUsageChart({ machineId }: { machineId: string }) {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/usage`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUsage(data.usage || []);
        setLoading(false);
      });
  }, [machineId]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading usage chart...</p>
      </div>
    );
  }

  if (usage.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">No usage data available.</p>
      </div>
    );
  }

  const chartData = {
    labels: usage.map((u) => new Date(u.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: usage.map((u) => u.cpu),
        borderColor: "#0d9488",
        backgroundColor: "rgba(13, 148, 136, 0.3)",
        tension: 0.3,
      },
      {
        label: "RAM Usage (%)",
        data: usage.map((u) => u.ram),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#d1d5db" } },
    },
    scales: {
      x: { ticks: { color: "#d1d5db" } },
      y: { ticks: { color: "#d1d5db" }, beginAtZero: true },
    },
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Machine Usage Chart
      </h3>

      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default MachineUsageChart;
