"use client";

import AnalyticsWidget from "@/components/dashboard/widgets/AnalyticsWidget";
import ChartsWidget from "@/components/dashboard/widgets/ChartsWidget";
import RecentActivityWidget from "@/components/dashboard/widgets/RecentActivityWidget";
import LicenseUsageWidget from "@/components/dashboard/widgets/LicenseUsageWidget";
import BillingOverviewWidget from "@/components/dashboard/widgets/BillingOverviewWidget";

export default function ClientDashboardPage() {
  return (
    <div className="p-6 space-y-8">

      {/* TOP GRID — ANALYTICS + LICENSE USAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsWidget />
        </div>
        <LicenseUsageWidget />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartsWidget />
        <BillingOverviewWidget />
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <RecentActivityWidget />
      </div>

    </div>
  );
}
