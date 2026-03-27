"use client";

import { useEffect, useState } from "react";

export default function MachineHistoryPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="))
          ?.split("=")[1];

        const res = await fetch("/api/client/machine-history", {
          headers: {
            "x-session-token": token || "",
          },
        });

        const data = await res.json();
        setMachines(data.machines || []);
      } catch (e) {
        console.error("Failed to load machine history", e);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="p-6">Loading machine history...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Machine History</h1>

      {machines.length === 0 && (
        <p className="text-gray-600">No machine activations found.</p>
      )}

      <div className="space-y-4">
        {machines.map((machine: any) => (
          <div
            key={machine.id}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {machine.machineName || "Unnamed Machine"}
            </h2>

            <p className="text-sm text-gray-700">
              <strong>Machine ID:</strong> {machine.machineId}
            </p>

            <p className="text-sm text-gray-700">
              <strong>OS Version:</strong> {machine.osVersion || "Unknown"}
            </p>

            <p className="text-sm text-gray-700">
              <strong>IP Address:</strong> {machine.ipAddress || "Unknown"}
            </p>

            <p className="text-sm text-gray-700">
              <strong>License Key:</strong>{" "}
              {machine.License?.licenseKey || "Unknown"}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Product:</strong>{" "}
              {machine.License?.productName || "Unknown"}
            </p>

            <p className="text-sm text-gray-500">
              <strong>Activated:</strong>{" "}
              {new Date(machine.activatedAt).toLocaleString()}
            </p>

            <p className="text-sm text-gray-500">
              <strong>Last Seen:</strong>{" "}
              {new Date(machine.lastSeenAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
