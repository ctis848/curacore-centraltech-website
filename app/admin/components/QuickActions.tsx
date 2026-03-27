"use client";

import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        <Link
          href="/admin/license-requests"
          className="px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition"
        >
          View License Requests
        </Link>

        <Link
          href="/admin/licenses"
          className="px-4 py-2 bg-green-600 text-white rounded text-center hover:bg-green-700 transition"
        >
          Manage Licenses
        </Link>

        <Link
          href="/admin/users"
          className="px-4 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700 transition"
        >
          Manage Users
        </Link>
      </div>
    </div>
  );
}
