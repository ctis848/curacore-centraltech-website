"use client";

import { useEffect, useState } from "react";

export default function ReminderLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const res = await fetch("/api/admin/reminders");
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    }
    loadLogs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reminder Logs</h1>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No reminder logs found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Company</th>
              <th className="border p-3">Reminder Type</th>
              <th className="border p-3">Reminder Date</th>
              <th className="border p-3">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td className="border p-3">{log.company_name}</td>
                <td className="border p-3">{log.reminder_key.split("-").pop()}</td>
                <td className="border p-3">{log.reminder_date}</td>
                <td className="border p-3">{log.sent_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
