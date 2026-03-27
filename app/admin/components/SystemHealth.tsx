"use client";

import { useEffect, useState } from "react";

export default function SystemHealth() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/admin/api/system-health")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          System Health
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        System Health
      </h2>

      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
        <li>Users: {data.users}</li>
        <li>Licenses: {data.licenses}</li>
        <li>Pending Requests: {data.requests}</li>
        <li>
          Status:{" "}
          <span className="text-green-600 dark:text-green-400">
            {data.status}
          </span>
        </li>
      </ul>
    </div>
  );
}
