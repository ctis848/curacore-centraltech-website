"use client";

import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";

function InvoicesTable() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/invoices", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices || []);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-gray-600 dark:text-gray-300">Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Invoices</h3>
        <p className="text-gray-600 dark:text-gray-300">You have no invoices.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Invoices</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Invoice ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Amount</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Date</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Download</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {invoice.invoiceId}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  ₦{invoice.amount}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[invoice.status] || "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {invoice.date
                    ? new Date(invoice.date).toLocaleDateString()
                    : "—"}
                </td>

                <td className="py-3 px-4">
                  <button className="flex items-center gap-2 text-teal-700 dark:text-teal-300 hover:underline">
                    <FiDownload size={18} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoicesTable;
