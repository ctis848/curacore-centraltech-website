"use client";

import { useEffect, useState } from "react";

export default function LicenseHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="))
          ?.split("=")[1];

        const res = await fetch("/api/client/license-history", {
          headers: {
            "x-session-token": token || "",
          },
        });

        const data = await res.json();
        setHistory(data.history || []);
      } catch (e) {
        console.error("Failed to load history", e);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="p-6">Loading license history...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">License History</h1>

      {history.length === 0 && (
        <p className="text-gray-600">No license history found.</p>
      )}

      <div className="space-y-4">
        {history.map((entry: any) => (
          <div
            key={entry.id}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {entry.License?.productName || "Unknown Product"}
            </h2>

            <p className="text-sm text-gray-700">
              <strong>Action:</strong> {entry.action}
            </p>

            {entry.details && (
              <p className="text-sm text-gray-600">
                <strong>Details:</strong> {entry.details}
              </p>
            )}

            <p className="text-sm text-gray-500">
              <strong>Date:</strong>{" "}
              {new Date(entry.createdAt).toLocaleString()}
            </p>

            <p className="text-sm text-gray-500">
              <strong>License Key:</strong> {entry.License?.licenseKey}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
