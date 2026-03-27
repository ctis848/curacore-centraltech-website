"use client";

import { useEffect, useState } from "react";

type MachineActivation = {
  id: string;
  machineId: string;
  machineName: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  activatedAt: string;
  lastSeenAt: string;
  License: {
    productName: string | null;
    licenseKey: string | null;
  };
};

export default function MachineHistoryPage() {
  const [rows, setRows] = useState<MachineActivation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/machines")
      .then((r) => r.json())
      .then((data) => setRows(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Machine History</h1>
      <p className="text-slate-500 mb-4">
        Track all machines that have activated your licenses.
      </p>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">No machine activations found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900/40">
              <tr>
                <th className="px-4 py-2 text-left">Machine Name</th>
                <th className="px-4 py-2 text-left">Machine ID</th>
                <th className="px-4 py-2 text-left">OS Version</th>
                <th className="px-4 py-2 text-left">IP Address</th>
                <th className="px-4 py-2 text-left">License</th>
                <th className="px-4 py-2 text-left">Activated At</th>
                <th className="px-4 py-2 text-left">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">
                    {m.machineName || <span className="text-slate-400">Unknown</span>}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{m.machineId}</td>
                  <td className="px-4 py-2">{m.osVersion || "-"}</td>
                  <td className="px-4 py-2">{m.ipAddress || "-"}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span>{m.License.productName || "License"}</span>
                      <span className="font-mono text-xs text-slate-500">
                        {m.License.licenseKey || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(m.activatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(m.lastSeenAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
