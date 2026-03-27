"use client";

export default function RecentActivityWidget() {
  const items = [
    "License ABC123 activated",
    "User updated profile",
    "New support ticket created",
    "Invoice #2024-11 paid",
  ];

  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Recent Activity</h2>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
