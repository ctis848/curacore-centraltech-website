"use client";

import { useEffect, useState } from "react";

function MachineWebSocketAlerts({ machineId }: { machineId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/machines/${machineId}/alerts`
    );

    ws.onopen = () => setConnected(true);

    ws.onmessage = (msg) => {
      try {
        const alert = JSON.parse(msg.data);
        setAlerts((prev) => [alert, ...prev]);
      } catch {}
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [machineId]);

  const levelColors: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    WARNING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Live Alerts Stream
        </h3>

        <span
          className={`text-sm ${
            connected ? "text-green-500" : "text-red-500"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No alerts received yet.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
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
                  {alert.timestamp
                    ? new Date(alert.timestamp).toLocaleString()
                    : "—"}
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
      )}
    </div>
  );
}

export default MachineWebSocketAlerts;
