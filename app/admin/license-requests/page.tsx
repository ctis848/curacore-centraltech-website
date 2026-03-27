"use client";

import { useEffect, useState } from "react";

export default function LicenseRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/license-requests")
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">License Requests</h1>

      <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No license requests found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="p-3">User</th>
                <th className="p-3">Product</th>
                <th className="p-3">Request Key</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3">{req.user?.email}</td>
                  <td className="p-3">{req.productName || "—"}</td>
                  <td className="p-3">{req.requestKey}</td>
                  <td className="p-3">{req.status}</td>
                  <td className="p-3">
                    {new Date(req.createdAt).toLocaleDateString()}
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
