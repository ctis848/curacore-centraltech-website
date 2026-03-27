"use client";

import { useEffect, useState } from "react";

function MachineAlertsPanel({ machineId }: { machineId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/alerts`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts || []);
        setLoading(false);
      });
  }, [machineId]);

  const levelColors: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    WARNING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Machine Alerts
        </h3>
        <p className="text-gray-600 dark:text-gray-300">No alerts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Machine Alerts
      </h3>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-600"
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  levelColors[alert.level] || "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {alert.level}
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "—"}
              </span>
            </div>

            <p className="text-gray-800 dark:text-gray-200">{alert.message}</p>

            {alert.meta && (
              <pre className="mt-2 text-xs bg-gray-200 dark:bg-gray-800 p-2 rounded-lg text-gray-700 dark:text-gray-300 overflow-x-auto">
{JSON.stringify(alert.meta, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineAlertsPanel;
