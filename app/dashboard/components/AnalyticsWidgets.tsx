"use client";

export default function AnalyticsWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
        <p className="text-gray-500 dark:text-gray-400">Active Licenses</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">12</h2>
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
        <p className="text-gray-500 dark:text-gray-400">Machines Registered</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">48</h2>
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
        <p className="text-gray-500 dark:text-gray-400">Pending Requests</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">3</h2>
      </div>
    </div>
  );
}
