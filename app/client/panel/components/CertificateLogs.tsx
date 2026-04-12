"use client";

import { useEffect, useState } from "react";

export default function CertificateLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/client/licenses/logs", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Certificate History</h2>

      {logs.length === 0 && (
        <p className="text-gray-500">No certificate activity yet.</p>
      )}

      {logs.length > 0 && (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="text-sm">
              <span className="font-semibold">{log.action}</span> —{" "}
              {log.license_key} —{" "}
              {new Date(log.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
