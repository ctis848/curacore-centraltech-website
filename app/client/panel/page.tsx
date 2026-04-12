"use client";

import { useEffect, useState } from "react";

import AnalyticsWidget from "@/components/dashboard/widgets/AnalyticsWidget";
import ChartsWidget from "@/components/dashboard/widgets/ChartsWidget";
import RecentActivityWidget from "@/components/dashboard/widgets/RecentActivityWidget";
import LicenseUsageWidget from "@/components/dashboard/widgets/LicenseUsageWidget";
import BillingOverviewWidget from "@/components/dashboard/widgets/BillingOverviewWidget";

interface AnalyticsData {
  activeLicenses?: number;
  pendingRequests?: number;
  supportTickets?: number;
  monthlyRevenue?: string | number;
  chartData?: { label: string; value: number }[];
}

interface LicenseUsageData {
  total?: number;
  used?: number;
  available?: number;
  expired?: number;
}

interface BillingData {
  currentPlan?: string;
  nextInvoiceAmount?: string;
  nextInvoiceDate?: string;
  paymentMethod?: string;
}

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [licenseUsage, setLicenseUsage] = useState<LicenseUsageData | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [activity, setActivity] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [analyticsRes, usageRes, billingRes, activityRes] =
          await Promise.all([
            fetch("/api/client/dashboard/analytics", { credentials: "include" }),
            fetch("/api/client/dashboard/license-usage", { credentials: "include" }),
            fetch("/api/client/dashboard/billing", { credentials: "include" }),
            fetch("/api/client/dashboard/activity", { credentials: "include" }),
          ]);

        if (!analyticsRes.ok) throw new Error("Failed to load analytics");
        if (!usageRes.ok) throw new Error("Failed to load license usage");
        if (!billingRes.ok) throw new Error("Failed to load billing");
        if (!activityRes.ok) throw new Error("Failed to load activity");

        setAnalytics(await analyticsRes.json());
        setLicenseUsage(await usageRes.json());
        setBilling(await billingRes.json());

        const activityData = await activityRes.json();
        setActivity(activityData.logs || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* TOP GRID — ANALYTICS + LICENSE USAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsWidget data={analytics} />
        </div>
        <LicenseUsageWidget data={licenseUsage} />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartsWidget data={analytics?.chartData || []} />
        <BillingOverviewWidget data={billing} />
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <RecentActivityWidget logs={activity} />
      </div>

    </div>
  );
}
