"use client";

import { useEffect, useState } from "react";
import RequireRole from "./components/RequireRole";
import DashboardKPI from "./components/dashboard/DashboardKPI";
import DashboardChart from "./components/dashboard/DashboardChart";
import DashboardErrorChart from "./components/dashboard/DashboardErrorChart";

interface DashboardData {
  totalUsers: number;
  totalLicenses: number;
  activeLicenses: number;
  totalRevenue: number;
  recentUsers: number[];
  recentLicenses: number[];
  recentRevenue: number[];
  recentErrors: number[];
}

interface Tenant {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantFilter, setTenantFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/admin/api/dashboard?tenant=${tenantFilter}`).then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([dashboardData, tenantData]) => {
        setData(dashboardData);
        setTenants(tenantData);
      })
      .finally(() => setLoading(false));
  }, [tenantFilter]);

  if (loading || !data) {
    return <p className="p-6 dark:text-white">Loading dashboard...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>

        {/* Tenant Filter */}
        <div className="flex gap-4">
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardKPI title="Total Users" value={data.totalUsers} />
          <DashboardKPI title="Total Licenses" value={data.totalLicenses} />
          <DashboardKPI title="Active Licenses" value={data.activeLicenses} />
          <DashboardKPI
            title="Total Revenue"
            value={`$${data.totalRevenue.toLocaleString()}`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart
            title="New Users (Last 30 Days)"
            data={data.recentUsers}
          />
          <DashboardChart
            title="New Licenses (Last 30 Days)"
            data={data.recentLicenses}
          />
          <DashboardChart
            title="Revenue (Last 30 Days)"
            data={data.recentRevenue}
          />
          <DashboardErrorChart
            title="Errors (Last 30 Days)"
            data={data.recentErrors}
          />
        </div>
      </div>
    </RequireRole>
  );
}
