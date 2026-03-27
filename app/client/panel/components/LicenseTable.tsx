"use client";

import { useState, useEffect } from "react";

function LicenseTable() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/licenses", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLicenses(data.licenses || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-gray-600 dark:text-gray-300">Loading licenses...</p>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Licenses
        </h3>
        <p className="text-gray-600 dark:text-gray-300">You have no licenses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Licenses
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">License Key</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Product</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Expires</th>
            </tr>
          </thead>

          <tbody>
            {licenses.map((license) => (
              <tr
                key={license.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.licenseKey}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.productName}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.status}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.expiresAt
                    ? new Date(license.expiresAt).toLocaleDateString()
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

export default LicenseTable;
