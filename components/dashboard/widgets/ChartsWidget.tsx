"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

// REGISTER EVERYTHING YOU USE
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface ChartsWidgetProps {
  data: any[]; // Dashboard passes an array (chartData)
}

export default function ChartsWidget({ data }: ChartsWidgetProps) {
  // Fallback if no data is provided
  const chartData = {
    labels: data?.map((d) => d.label) ?? ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Revenue",
        data: data?.map((d) => d.value) ?? [1200, 1800, 2400, 3000, 4820],
        borderColor: "#0d9488",
        backgroundColor: "rgba(13, 148, 136, 0.2)",
      },
    ],
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Revenue Growth</h2>
      <Line data={chartData} />
    </div>
  );
}
