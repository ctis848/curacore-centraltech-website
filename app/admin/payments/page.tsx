"use client";

import { useEffect, useState } from "react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your real API later
    fetch("/admin/api/payments")
      .then(async (res) => {
        try {
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      })
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPayments([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Payments</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage all payment transactions.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && payments.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-300">
          No payments found.
        </div>
      )}

      {/* Payments Table */}
      {!loading && payments.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 dark:text-white">{p.id}</td>
                  <td className="px-4 py-3 dark:text-white">{p.client}</td>
                  <td className="px-4 py-3 font-semibold dark:text-white">
                    ₦{Number(p.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === "success"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                          : p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 dark:text-white">
                    {new Date(p.createdAt).toLocaleString()}
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
