"use client";

import { Doughnut } from "react-chartjs-2";

interface ChartProps {
  data: any;
}

export default function RenewalStatusChart({ data }: ChartProps) {
  return <Doughnut data={data} />;
}
