"use client";

import { Bar } from "react-chartjs-2";

interface ChartProps {
  data: any;
}

export default function RevenueChart({ data }: ChartProps) {
  return <Bar data={data} />;
}
