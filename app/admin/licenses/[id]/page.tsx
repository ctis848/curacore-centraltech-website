"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { LicenseRow } from "@/types/admin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LicenseDetails({ params }: PageProps) {
  const supabase = supabaseBrowser();

  // ⭐ Next.js 16: unwrap params using React.use()
  const { id } = React.use(params);

  const [license, setLicense] = useState<LicenseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, [id]);

  async function loadLicense() {
    const { data } = await supabase
      .from("License")
      .select("*")
      .eq("id", id)
      .single();

    setLicense(data);
    setLoading(false);
  }

  async function action(endpoint: string) {
    const res = await fetch(`/api/admin/licenses/${id}/${endpoint}`, {
      method: "POST",
    });

    const json = await res.json();
    alert(json.message);

    if (json.success) loadLicense();
  }

  if (loading) return <p>Loading...</p>;
  if (!license) return <p>License not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">License Details</h1>

      <div className="bg-white border rounded p-4 space-y-2">
        <p><strong>Product:</strong> {license.productName}</p>
        <p><strong>License Key:</strong> {license.licenseKey}</p>
        <p><strong>Status:</strong> {license.status}</p>
        <p><strong>Expires At:</strong> {license.expiresAt}</p>
        <p><strong>Annual Fee %:</strong> {license.annualFeePercent}%</p>
        <p><strong>Annual Fee Paid Until:</strong> {license.annualFeePaidUntil}</p>
      </div>

      <div className="mt-4 space-x-3">
        <button
          onClick={() => action("regenerate")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Regenerate Key
        </button>

        <button
          onClick={() => action("transfer")}
          className="px-4 py-2 bg-amber-600 text-white rounded"
        >
          Transfer Machine
        </button>

        {license.status === "ACTIVE" ? (
          <button
            onClick={() => action("deactivate")}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => action("activate")}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Reactivate
          </button>
        )}
      </div>
    </div>
  );
}
