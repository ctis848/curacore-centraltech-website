"use client";

import { LineChart, BarChart, Card, Title } from "@tremor/react";

export default function ChartsSection({ stats }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <Card>
        <Title>License Activity</Title>
        <LineChart
          className="mt-6"
          data={stats.licenseActivity}
          index="date"
          categories={["active", "expired"]}
          colors={["teal", "red"]}
        />
      </Card>

      <Card>
        <Title>Machine Usage</Title>
        <BarChart
          className="mt-6"
          data={stats.machineUsage}
          index="date"
          categories={["machines"]}
          colors={["blue"]}
        />
      </Card>
    </div>
  );
}
