"use client";

export default function RecentActivity() {
  const activity = [
    "Activated license LIC-001",
    "Machine MCH-002 went offline",
    "Invoice INV-1002 generated",
    "Support ticket #234 opened",
    "License LIC-003 pending approval",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Recent Activity
      </h3>

      <ul className="space-y-3">
        {activity.map((item, i) => (
          <li
            key={i}
            className="
              p-3 bg-gray-100 dark:bg-gray-700 rounded-lg
              text-gray-800 dark:text-gray-200
            "
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
