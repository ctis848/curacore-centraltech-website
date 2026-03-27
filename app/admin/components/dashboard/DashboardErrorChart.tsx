"use client";

import { Bar } from "react-chartjs-2";

export default function DashboardErrorChart({
  title,
  data,
}: {
  title: string;
  data: number[];
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow rounded">
      <h2 className="text-lg font-semibold dark:text-white mb-4">{title}</h2>
      <Bar
        data={{
          labels: data.map((_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: title,
              data,
              backgroundColor: "rgba(239,68,68,0.6)",
            },
          ],
        }}
      />
    </div>
  );
}
