"use client";

interface AnalyticsWidgetProps {
  data: any;
}

export default function AnalyticsWidget({ data }: AnalyticsWidgetProps) {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Analytics Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Active Licenses" value={data?.activeLicenses ?? "0"} />
        <Stat label="Pending Requests" value={data?.pendingRequests ?? "0"} />
        <Stat label="Support Tickets" value={data?.supportTickets ?? "0"} />
        <Stat label="Monthly Revenue" value={data?.monthlyRevenue ?? "$0"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
