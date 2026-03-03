"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface License {
  id: string;
  license_key: string;
  product_name: string;
  max_machines: number;
  machines_used: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function LicenseHistoryPage() {
  const supabase = createSupabaseClient();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLicenses(data);
      }

      setLoading(false);
    }

    loadHistory();
  }, []);

  if (loading) {
    return <p className="p-6">Loading license history...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">License History</h1>

      {licenses.length === 0 && (
        <p className="text-gray-600">No license history found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {licenses.map((lic) => (
          <div
            key={lic.id}
            className="p-5 bg-white shadow rounded border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              {lic.product_name}
            </h2>

            <p className="text-sm text-gray-700">
              <strong>License Key:</strong> {lic.license_key}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Status:</strong>{" "}
              <span
                className={
                  lic.status === "active"
                    ? "text-green-600"
                    : lic.status === "expired"
                    ? "text-red-600"
                    : lic.status === "revoked"
                    ? "text-gray-600"
                    : "text-yellow-600"
                }
              >
                {lic.status.toUpperCase()}
              </span>
            </p>

            <p className="text-sm text-gray-700">
              <strong>Machines:</strong> {lic.machines_used} / {lic.max_machines}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Start Date:</strong> {lic.start_date}
            </p>

            <p className="text-sm text-gray-700">
              <strong>End Date:</strong> {lic.end_date}
            </p>

            <p className="text-xs text-gray-500 mt-3">
              Created: {new Date(lic.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
