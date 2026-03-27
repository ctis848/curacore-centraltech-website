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
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function SystemLogsChart({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          System Logs Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        System Logs Activity
      </h2>

      <Line
        data={data}
        height={300}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#e5e7eb", // Light gray for dark mode
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#9ca3af" },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: "#9ca3af" },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
          },
        }}
      />
    </div>
  );
}
