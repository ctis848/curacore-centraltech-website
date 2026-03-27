"use client";

import { useEffect, useState } from "react";

function MachineHealthStatus({ machineId }: { machineId: string }) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setHealth(data.health || null);
        setLoading(false);
      });
  }, [machineId]);

  const statusColors: Record<string, string> = {
    GOOD: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    WARNING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Checking health...</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Health data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Health Status</h4>

      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          statusColors[health.status] || "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {health.status}
      </span>

      <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
        <p>CPU Load: <strong>{health.cpu}%</strong></p>
        <p>RAM Load: <strong>{health.ram}%</strong></p>
        <p>Disk Usage: <strong>{health.disk}%</strong></p>
        <p>Temperature: <strong>{health.temp}°C</strong></p>
      </div>
    </div>
  );
}

export default MachineHealthStatus;
