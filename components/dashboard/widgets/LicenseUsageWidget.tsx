"use client";

interface LicenseUsageWidgetProps {
  data: any; // Dashboard passes license usage data
}

export default function LicenseUsageWidget({ data }: LicenseUsageWidgetProps) {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">License Usage</h2>

      <div className="grid grid-cols-2 gap-4">
        <Usage
          label="Total Licenses"
          value={data?.total ?? "0"}
        />
        <Usage
          label="Used"
          value={data?.used ?? "0"}
        />
        <Usage
          label="Available"
          value={data?.available ?? "0"}
        />
        <Usage
          label="Expired"
          value={data?.expired ?? "0"}
        />
      </div>
    </div>
  );
}

function Usage({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
