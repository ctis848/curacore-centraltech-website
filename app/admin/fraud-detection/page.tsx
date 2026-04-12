"use client";

import { useEffect, useState } from "react";

type FraudResponse = {
  suspiciousIps: { ip: string; count: number }[];
  suspiciousUsers: { userId: string; machines: string[] }[];
  recentLogs: any[];
  error?: string;
};

export default function FraudDetectionPage() {
  const [data, setData] = useState<FraudResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/fraud-detection");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to load fraud data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Fraud Detection</h1>
        <p>Analyzing validation logs...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Fraud Detection</h1>
        <p className="text-red-600">Failed to load fraud detection data.</p>
      </div>
    );
  }

  const { suspiciousIps, suspiciousUsers, recentLogs } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fraud Detection</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Suspicious IPs</h2>
          {suspiciousIps.length === 0 ? (
            <p>No suspicious IPs detected.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {suspiciousIps.map((ip) => (
                <li key={ip.ip} className="flex justify-between">
                  <span>{ip.ip}</span>
                  <span>{ip.count} requests</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Suspicious Users</h2>
          {suspiciousUsers.length === 0 ? (
            <p>No suspicious users detected.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {suspiciousUsers.map((u) => (
                <li key={u.userId}>
                  <div className="font-mono text-xs mb-1">{u.userId}</div>
                  <div className="text-xs">
                    Machines: {u.machines.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Recent Validation Logs</h2>
        {recentLogs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Machine</th>
                <th className="p-2 text-left">IP</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log: any) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{log.product_name || "Unknown"}</td>
                  <td className="p-2">{log.machine_id}</td>
                  <td className="p-2">{log.ip_address || "-"}</td>
                  <td className="p-2">{log.status}</td>
                  <td className="p-2">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
