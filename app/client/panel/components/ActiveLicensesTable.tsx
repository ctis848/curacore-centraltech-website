"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DownloadCertificateButton from "@/app/client/panel/components/DownloadCertificateButton";
import ViewCertificateButton from "@/app/client/panel/components/ViewCertificateButton";

type ActiveLicense = {
  id: string;
  license_key: string;
  product_name: string;
  status: string;
  expires_at: string | null;
};

export default function ActiveLicensesTable() {
  const [licenses, setLicenses] = useState<ActiveLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/licenses/active", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load active licenses");
        }

        const data = await res.json();
        setLicenses(data.licenses || []);
      } catch (err: any) {
        setError(err.message || "Unable to load licenses");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    GRACE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-gray-600 dark:text-gray-300">Loading active licenses…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Active Licenses
        </h3>
        <p className="text-gray-600 dark:text-gray-300">You have no active licenses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Active Licenses
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">License Key</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Product</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Expires</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {licenses.map((license) => (
              <tr
                key={license.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-mono">
                  {license.license_key}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.product_name}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[license.status] || "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {license.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {license.expires_at
                    ? new Date(license.expires_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="py-3 px-4 space-x-3 flex items-center">
                  <Link
                    href={`/client/panel/licenses/${license.license_key}`}
                    className="text-blue-600 dark:text-blue-400 underline text-sm"
                  >
                    View Details
                  </Link>

                  <DownloadCertificateButton licenseKey={license.license_key} />

                  <ViewCertificateButton licenseKey={license.license_key} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
