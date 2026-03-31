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

type LineChartProps = {
  labels: string[];
  data: number[];
};

export default function LineChart({ labels, data }: LineChartProps) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Activations",
            data,
            borderColor: "rgb(34,197,94)",
            backgroundColor: "rgba(34,197,94,0.3)",
          },
        ],
      }}
    />
  );
}
