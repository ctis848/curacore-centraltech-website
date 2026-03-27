"use client";

import { useEffect, useState } from "react";

export default function RecentRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/admin/api/recent-requests")
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Recent Requests
      </h2>

      {requests.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">
          No recent requests found.
        </p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border-b dark:border-gray-700 pb-2 last:border-none"
          >
            <p className="font-semibold dark:text-white">
              {req.method} {req.path}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(req.createdAt).toLocaleString()}
            </p>

            {req.user && (
              <p className="text-xs text-gray-400">
                User: {req.user.email}
              </p>
            )}

            {req.organization && (
              <p className="text-xs text-gray-400">
                Org: {req.organization.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
