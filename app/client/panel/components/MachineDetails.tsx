"use client";

import { useEffect, useState } from "react";

function MachineDetails({ machineId }: { machineId: string }) {
  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMachine(data.machine || null);
        setLoading(false);
      });
  }, [machineId]);

  const statusColors: Record<string, string> = {
    ONLINE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    OFFLINE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    SUSPENDED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading machine...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Machine not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Machine Details
      </h3>

      <div className="space-y-4">

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Machine ID</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{machine.machineId}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Name</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{machine.name}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Type</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{machine.type}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Status</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[machine.status] || "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {machine.status}
          </span>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last Active</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">
            {machine.lastActive ? new Date(machine.lastActive).toLocaleString() : "—"}
          </p>
        </div>

      </div>
    </div>
  );
}

export default MachineDetails;
