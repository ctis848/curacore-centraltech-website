"use client";

import { Line } from "react-chartjs-2";

export default function DashboardChart({
  title,
  data,
}: {
  title: string;
  data: number[];
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow rounded">
      <h2 className="text-lg font-semibold dark:text-white mb-4">{title}</h2>
      <Line
        data={{
          labels: data.map((_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: title,
              data,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.2)",
            },
          ],
        }}
      />
    </div>
  );
}
