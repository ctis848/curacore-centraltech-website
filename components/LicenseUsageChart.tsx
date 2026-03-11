"use client";

import { Bar } from "react-chartjs-2";

interface UsageChartData {
  labels: string[];
  values: number[];
}

export default function LicenseUsageChart({ data }: { data: UsageChartData }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">License Usage</h2>

      <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Active Licenses",
              data: data.values,
              backgroundColor: "rgba(16, 185, 129, 0.6)",
            },
          ],
        }}
      />
    </div>
  );
}
