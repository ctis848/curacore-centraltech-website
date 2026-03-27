"use client";

import { useEffect, useState } from "react";

function MachinePerformanceSummary({ machineId }: { machineId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/performance`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || null);
        setLoading(false);
      });
  }, [machineId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading performance...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Performance Summary
        </h3>
        <p className="text-gray-600 dark:text-gray-300">No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Performance Summary
      </h3>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Average CPU</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {stats.avgCpu}%
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Average RAM</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {stats.avgRam}%
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Uptime</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {stats.uptime} hrs
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Errors</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.errors}
          </p>
        </div>

      </div>
    </div>
  );
}

export default MachinePerformanceSummary;
