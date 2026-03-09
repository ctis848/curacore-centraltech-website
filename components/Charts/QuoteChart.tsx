"use client";

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function QuoteCharts() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [3, 5, 2, 7, 4, 1, 6];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Bar Chart</h2>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Requests",
                data: values,
                backgroundColor: "rgba(13, 148, 136, 0.6)",
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Line Chart</h2>
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Requests",
                data: values,
                borderColor: "rgb(13, 148, 136)",
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Pie Chart</h2>
        <Pie
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  "#0d9488",
                  "#14b8a6",
                  "#2dd4bf",
                  "#5eead4",
                  "#99f6e4",
                  "#ccfbf1",
                  "#f0fdfa",
                ],
              },
            ],
          }}
        />
      </div>

    </div>
  );
}
