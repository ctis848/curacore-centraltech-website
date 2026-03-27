"use client";

import { Line } from "react-chartjs-2";

interface ChartProps {
  data: any;
}

export default function MachineActivityChart({ data }: ChartProps) {
  return <Line data={data} />;
}
