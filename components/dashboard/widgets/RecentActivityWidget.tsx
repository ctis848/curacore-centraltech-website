"use client";

interface RecentActivityWidgetProps {
  logs: string[]; // Dashboard passes an array of activity strings
}

export default function RecentActivityWidget({ logs }: RecentActivityWidgetProps) {
  const items = logs ?? [];

  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Recent Activity</h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
