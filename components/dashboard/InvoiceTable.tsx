"use client";

import { FiDownload } from "react-icons/fi";

type InvoiceRow = {
  id: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
};

const invoices: InvoiceRow[] = [
  { id: "INV-1001", amount: "$199.00", status: "Paid", date: "2025-01-12" },
  { id: "INV-1002", amount: "$49.00", status: "Pending", date: "2025-02-05" },
  { id: "INV-1003", amount: "$299.00", status: "Overdue", date: "2024-12-20" },
];

const statusColors: Record<InvoiceRow["status"], string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function InvoiceTable() {
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
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.date}</td>
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
