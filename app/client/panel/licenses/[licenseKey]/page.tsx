"use client";

import { useEffect, useState } from "react";
import DownloadCertificateButton from "@/app/client/panel/components/DownloadCertificateButton";
import ViewCertificateButton from "@/app/client/panel/components/ViewCertificateButton";
import CertificateLogs from "@/app/client/panel/components/CertificateLogs";

type LicenseDetails = {
  id: string;
  product_name: string;
  license_key: string;
  status: string;
  expires_at: string | null;
  activation_count: number;
  max_activations: number | null;
  annual_fee_percent: number | null;
  annual_fee_paid_until: string | null;
  created_at: string;
  updated_at: string;
};

type Activation = {
  id: string;
  machine_id: string;
  activated_at: string;
};

export default function LicenseDetailsPage({
  params,
}: {
  params: { licenseKey: string };
}) {
  const { licenseKey } = params;

  const [license, setLicense] = useState<LicenseDetails | null>(null);
  const [history, setHistory] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/client/licenses/${licenseKey}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load license");

        const d = await res.json();
        setLicense(d.license || null);
        setHistory(d.history || []);
      } catch (err: any) {
        setError(err.message || "Unable to load license");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [licenseKey]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300">Loading license details…</p>
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {error || "License not found."}
        </p>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      GRACE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[status] || "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-300">
        License Details — {license.product_name}
      </h1>

      {/* License Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4 border dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">License Information</h2>
          {statusBadge(license.status)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Info label="Product" value={license.product_name} />
          <Info label="License Key" value={license.license_key} mono />
          <Info
            label="Expires At"
            value={
              license.expires_at
                ? new Date(license.expires_at).toLocaleDateString()
                : "N/A"
            }
          />
          <Info
            label="Activation Count"
            value={`${license.activation_count} / ${
              license.max_activations ?? "Unlimited"
            }`}
          />
          <Info
            label="Annual Fee (%)"
            value={license.annual_fee_percent ?? "N/A"}
          />
          <Info
            label="Annual Fee Paid Until"
            value={
              license.annual_fee_paid_until
                ? new Date(license.annual_fee_paid_until).toLocaleDateString()
                : "N/A"
            }
          />
          <Info
            label="Created At"
            value={new Date(license.created_at).toLocaleString()}
          />
          <Info
            label="Last Updated"
            value={new Date(license.updated_at).toLocaleString()}
          />
        </div>

        {/* Certificate Buttons */}
        <div className="flex gap-4 pt-4">
          <DownloadCertificateButton licenseKey={license.license_key} />
          <ViewCertificateButton licenseKey={license.license_key} />
        </div>
      </div>

      {/* Activation History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-semibold">Machine Activation History</h2>

        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No activation history found.</p>
        )}

        {history.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Machine ID</th>
                  <th className="px-4 py-2 text-left">Activated At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 font-mono">{h.machine_id}</td>
                    <td className="px-4 py-2">
                      {new Date(h.activated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certificate Logs */}
      <CertificateLogs />
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: any;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <p className={mono ? "font-mono" : ""}>{value}</p>
    </div>
  );
}
