"use client";

import AnalyticsWidget from "@/components/dashboard/widgets/AnalyticsWidget";
import ChartsWidget from "@/components/dashboard/widgets/ChartsWidget";
import RecentActivityWidget from "@/components/dashboard/widgets/RecentActivityWidget";
import LicenseUsageWidget from "@/components/dashboard/widgets/LicenseUsageWidget";
import BillingOverviewWidget from "@/components/dashboard/widgets/BillingOverviewWidget";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <AnalyticsWidget />
      <ChartsWidget />
      <RecentActivityWidget />
      <LicenseUsageWidget />
      <BillingOverviewWidget />
    </div>
  );
}
