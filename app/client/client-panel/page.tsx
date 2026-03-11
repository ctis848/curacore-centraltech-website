"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// CHART.JS SETUP
import "@/app/client/client-panel/utils/chartjs-setup";

// CHART COMPONENTS
import LicenseUsageChart from "./charts/LicenseUsageChart";
import RevenueChart from "./charts/RevenueChart";
import MachineActivityChart from "./charts/MachineActivityChart";
import PlanBreakdownChart from "./charts/PlanBreakdownChart";
import RenewalStatusChart from "./charts/RenewalStatusChart";

// TYPES FOR CARDS
interface ActivityCardProps {
  title: string;
  value: string;
  href: string;
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
}

export default function ClientDashboard() {
  const supabase = createClientComponentClient();

  const [stats, setStats] = useState({
    licenses: 0,
    invoices: 0,
    machines: 0,
    tickets: 0,
  });

  // CHART STATES
  const [licenseUsage, setLicenseUsage] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [machineActivity, setMachineActivity] = useState<any[]>([]);
  const [planBreakdown, setPlanBreakdown] = useState<any[]>([]);
  const [renewalStatus, setRenewalStatus] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    // CARD COUNTS
    const { count: licenseCount } = await supabase
      .from("licenses")
      .select("*", { count: "exact", head: true });

    const { count: invoiceCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    const { count: machineCount } = await supabase
      .from("machines")
      .select("*", { count: "exact", head: true });

    const { count: ticketCount } = await supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true });

    setStats({
      licenses: licenseCount || 0,
      invoices: invoiceCount || 0,
      machines: machineCount || 0,
      tickets: ticketCount || 0,
    });

    // CHART DATA (RPC FUNCTIONS)
    const { data: licenseUsageRows } = await supabase.rpc("license_usage_daily");
    const { data: revenueRows } = await supabase.rpc("monthly_revenue");
    const { data: machineRows } = await supabase.rpc("machine_activity_daily");
    const { data: planRows } = await supabase.rpc("license_plan_breakdown");
    const { data: renewalRows } = await supabase.rpc("license_renewal_breakdown");

    setLicenseUsage(licenseUsageRows || []);
    setRevenue(revenueRows || []);
    setMachineActivity(machineRows || []);
    setPlanBreakdown(planRows || []);
    setRenewalStatus(renewalRows || []);

    setLoading(false);
  }

  // CHART DATA TRANSFORMERS
  const licenseUsageData = {
    labels: licenseUsage.map((r) => r.day),
    datasets: [
      {
        label: "Activations",
        data: licenseUsage.map((r) => r.activations),
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.3)",
      },
    ],
  };

  const revenueData = {
    labels: revenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue",
        data: revenue.map((r) => r.revenue),
        backgroundColor: "#6366f1",
      },
    ],
  };

  const machineActivityData = {
    labels: machineActivity.map((r) => r.day),
    datasets: [
      {
        label: "Active Machines",
        data: machineActivity.map((r) => r.active_count),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.3)",
      },
    ],
  };

  const planBreakdownData = {
    labels: planBreakdown.map((r) => r.plan),
    datasets: [
      {
        data: planBreakdown.map((r) => r.total),
        backgroundColor: ["#14b8a6", "#6366f1", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const renewalStatusData = {
    labels: renewalStatus.map((r) => r.renewal_status),
    datasets: [
      {
        data: renewalStatus.map((r) => r.total),
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
      },
    ],
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Client Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your CentralCore client panel.
        </p>
      </div>

      {/* ACTIVITY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <ActivityCard
          title="Active Licenses"
          value={loading ? "Loading..." : `${stats.licenses} Active`}
          href="/client/client-panel/licenses"
        />

        <ActivityCard
          title="Invoices"
          value={loading ? "Loading..." : `${stats.invoices} Total`}
          href="/client/client-panel/invoices"
        />

        <ActivityCard
          title="Machines"
          value={loading ? "Loading..." : `${stats.machines} Registered`}
          href="/client/client-panel/machines"
        />

        <ActivityCard
          title="Support Tickets"
          value={loading ? "Loading..." : `${stats.tickets} Open`}
          href="/client/client-panel/support"
        />

      </div>

      {/* ORIGINAL DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <DashboardCard
          title="Billing"
          description="View invoices, payments, and subscriptions."
          href="/client/client-panel/billing"
        />

        <DashboardCard
          title="Support"
          description="Get help or contact support."
          href="/client/client-panel/support"
        />

      </div>

      {/* ANALYTICS SECTION */}
      <div className="space-y-10 mt-10">

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Analytics Overview
        </h2>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">License Usage Over Time</h3>
          <LicenseUsageChart data={licenseUsageData} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <RevenueChart data={revenueData} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Machine Activity</h3>
          <MachineActivityChart data={machineActivityData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">License Plan Breakdown</h3>
            <PlanBreakdownChart data={planBreakdownData} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Renewal Status</h3>
            <RenewalStatusChart data={renewalStatusData} />
          </div>

        </div>

      </div>

    </div>
  );
}

// COMPONENTS WITH TYPES

function ActivityCard({ title, value, href }: ActivityCardProps) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-teal-600 dark:text-teal-300 text-xl font-bold mt-2">
        {value}
      </p>
    </Link>
  );
}

function DashboardCard({ title, description, href }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
    </Link>
  );
}
