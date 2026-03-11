"use client";

import { Pie } from "react-chartjs-2";

interface ChartProps {
  data: any;
}

export default function PlanBreakdownChart({ data }: ChartProps) {
  return <Pie data={data} />;
}
