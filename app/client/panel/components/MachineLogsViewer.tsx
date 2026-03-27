"use client";

import { useEffect, useState } from "react";

function MachineLogsViewer({ machineId }: { machineId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/logs`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      });
  }, [machineId]);

  const levelColors: Record<string, string> = {
    INFO: "text-blue-600 dark:text-blue-300",
    WARN: "text-yellow-600 dark:text-yellow-300",
    ERROR: "text-red-600 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">No logs found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Machine Logs
      </h3>

      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-600"
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`font-semibold ${
                  levelColors[log.level] || "text-gray-600 dark:text-gray-300"
                }`}
              >
                {log.level}
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
              </span>
            </div>

            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {log.message}
            </p>

            {log.meta && (
              <pre className="mt-2 text-xs bg-gray-200 dark:bg-gray-800 p-2 rounded-lg text-gray-700 dark:text-gray-300 overflow-x-auto">
{JSON.stringify(log.meta, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineLogsViewer;
