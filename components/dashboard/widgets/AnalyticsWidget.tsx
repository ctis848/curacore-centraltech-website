"use client";

export default function AnalyticsWidget() {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Analytics Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Active Licenses" value="128" />
        <Stat label="Pending Requests" value="14" />
        <Stat label="Support Tickets" value="5" />
        <Stat label="Monthly Revenue" value="$4,820" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
