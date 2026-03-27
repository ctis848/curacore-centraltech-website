"use client";

import DashboardCard from "./DashboardCard";

export default function InvoiceSummary({ stats }: any) {
  return (
    <div className="bg-white rounded-xl shadow border p-8">
      <h3 className="text-2xl font-bold mb-6">Invoice Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Pending" value={stats.pendingInvoices} color="text-yellow-600" />
        <DashboardCard title="Paid" value={stats.paidInvoices} color="text-green-600" />
        <DashboardCard title="Overdue" value={stats.overdueInvoices} color="text-red-600" />
      </div>
    </div>
  );
}
