"use client";

type LicenseRow = {
  id: string;
  product: string;
  status: "Active" | "Expired" | "Pending";
  expiry: string;
};

const licenses: LicenseRow[] = [
  { id: "LIC-001", product: "CentralCore Pro", status: "Active", expiry: "2026-12-01" },
  { id: "LIC-002", product: "CentralCore Lite", status: "Expired", expiry: "2024-05-10" },
  { id: "LIC-003", product: "CentralCore Enterprise", status: "Pending", expiry: "2025-08-22" },
];

const statusColors: Record<LicenseRow["status"], string> = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

export default function LicenseTable() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        License Overview
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">License ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Product</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Expiry Date</th>
            </tr>
          </thead>

          <tbody>
            {licenses.map((license) => (
              <tr
                key={license.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.product}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[license.status]}`}
                  >
                    {license.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
