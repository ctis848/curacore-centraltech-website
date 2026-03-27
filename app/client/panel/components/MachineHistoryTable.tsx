"use client";

import { useState, useEffect } from "react";

function MachineHistoryTable() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/machines", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMachines(data.machines || []);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    ONLINE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    OFFLINE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    SUSPENDED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-gray-600 dark:text-gray-300">Loading machine history...</p>
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Machine History
        </h3>
        <p className="text-gray-600 dark:text-gray-300">No machines found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Machine History
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Machine ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Last Active</th>
            </tr>
          </thead>

          <tbody>
            {machines.map((machine) => (
              <tr
                key={machine.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.machineId}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.name}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.type}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[machine.status] || "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {machine.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.lastActive
                    ? new Date(machine.lastActive).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MachineHistoryTable;
