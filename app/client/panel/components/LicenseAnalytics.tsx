"use client";

import DashboardCard from "./DashboardCard";

export default function LicenseAnalytics({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Total Licenses"
        value={stats.totalLicenses}
        color="text-teal-700"
      />
      <DashboardCard
        title="Expired Licenses"
        value={stats.expiredLicenses}
        color="text-red-600"
      />
      <DashboardCard
        title="Renewals Due"
        value={stats.renewalsDue}
        color="text-yellow-600"
      />
    </div>
  );
}
