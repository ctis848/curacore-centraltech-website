"use client";

export default function LicenseUsageWidget() {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">License Usage</h2>

      <div className="grid grid-cols-2 gap-4">
        <Usage label="Total Licenses" value="200" />
        <Usage label="Used" value="128" />
        <Usage label="Available" value="72" />
        <Usage label="Expired" value="15" />
      </div>
    </div>
  );
}

function Usage({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
