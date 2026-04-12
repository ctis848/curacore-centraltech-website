"use client";

import { useEffect, useState } from "react";

export default function ValidationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/validation-logs");
        const json = await res.json();
        setLogs(json.logs || []);
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Validation Logs</h1>

      {loading && <p>Loading logs...</p>}

      {!loading && logs.length === 0 && (
        <p>No validation logs found.</p>
      )}

      {!loading && logs.length > 0 && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">User</th>
              <th className="p-2 border">Machine</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td className="p-2 border">{log.user_email || "Unknown"}</td>
                <td className="p-2 border">{log.machine_id}</td>
                <td className="p-2 border">{log.product_name}</td>
                <td className="p-2 border">{log.status}</td>
                <td className="p-2 border">{log.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
