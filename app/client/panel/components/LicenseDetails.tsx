"use client";

import { useEffect, useState } from "react";

export default function LicenseDetails({ licenseKey }: { licenseKey: string }) {
  const [license, setLicense] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/client/licenses/${licenseKey}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load license details.");
          setLoading(false);
          return;
        }

        setLicense(data.license || null);
        setLogs(data.logs || []);
      } catch (err) {
        setError("Network error. Please try again.");
      }

      setLoading(false);
    }

    load();
  }, [licenseKey]);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    expired: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 animate-pulse">
        <p className="text-gray-600 dark:text-gray-300">Loading license details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 space-y-3">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">License Details</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>

        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Retry
        </button>
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
    <div className="space-y-6">
      {/* License Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          License Details
        </h3>

        <div className="space-y-4">
          <Detail label="License Key" value={license.license_key} mono />
          <Detail label="Product" value={license.product_name} />
          <Detail
            label="Status"
            value={
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[license.status] || "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {license.status.toUpperCase()}
              </span>
            }
          />
          <Detail
            label="Expires"
            value={
              license.expires_at
                ? new Date(license.expires_at).toLocaleDateString()
                : "—"
            }
          />
          <Detail
            label="Created"
            value={
              license.created_at
                ? new Date(license.created_at).toLocaleString()
                : "—"
            }
          />
          <Detail
            label="Last Updated"
            value={
              license.updated_at
                ? new Date(license.updated_at).toLocaleString()
                : "—"
            }
          />

          <Detail
            label="Machine Binding"
            value={license.machine_id || "Not yet activated"}
            mono
          />
        </div>
      </div>

      {/* Activation Logs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Activation Logs
        </h3>

        {logs.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No activation logs found.</p>
        )}

        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="border-b dark:border-gray-700 pb-2">
              <p className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: any;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
      <p
        className={`text-gray-800 dark:text-gray-200 font-semibold ${
          mono ? "font-mono break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
