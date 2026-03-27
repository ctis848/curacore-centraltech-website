"use client";

import { useEffect, useState } from "react";

export default function LicenseDetails({ licenseKey }: { licenseKey: string }) {
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/licenses/${licenseKey}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLicense(data.license || null);
        setLoading(false);
      });
  }, [licenseKey]);

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading license details...</p>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          License Details
        </h3>
        <p className="text-gray-600 dark:text-gray-300">License not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        License Details
      </h3>

      <div className="space-y-4">

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">License Key</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{license.licenseKey}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Product</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{license.productName}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Status</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[license.status] || "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {license.status}
          </span>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Expires</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">
            {license.expiresAt
              ? new Date(license.expiresAt).toLocaleDateString()
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Created</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">
            {license.createdAt
              ? new Date(license.createdAt).toLocaleString()
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last Updated</p>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">
            {license.updatedAt
              ? new Date(license.updatedAt).toLocaleString()
              : "—"}
          </p>
        </div>

      </div>
    </div>
  );
}
