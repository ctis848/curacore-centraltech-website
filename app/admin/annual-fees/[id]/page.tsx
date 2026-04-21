"use client";

import { use, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { LicenseRow } from "@/types/admin";

export default function AnnualFeeDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ⭐ FIXED for Next.js 15+
  const supabase = supabaseBrowser();

  const [license, setLicense] = useState<LicenseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, []);

  async function loadLicense() {
    const { data } = await supabase
      .from("License")
      .select("*")
      .eq("id", id)
      .single();

    setLicense(data);
    setLoading(false);
  }

  async function generateInvoice() {
    const res = await fetch(`/api/admin/annual-fees/${id}/generate-invoice`, {
      method: "POST",
    });

    const json = await res.json();
    alert(json.message);
  }

  async function markPaid() {
    const res = await fetch(`/api/admin/annual-fees/${id}/mark-paid`, {
      method: "POST",
    });

    const json = await res.json();
    alert(json.message);

    if (json.success) loadLicense();
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!license) return <p className="text-red-600">License not found.</p>;

  const now = new Date();
  const paidUntil = license.annualFeePaidUntil
    ? new Date(license.annualFeePaidUntil)
    : null;

  const isOverdue = paidUntil ? paidUntil < now : true;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Annual Fee Details</h1>

      <div className="bg-white border rounded p-5 shadow-sm space-y-3">
        <div>
          <p className="text-sm text-slate-500">Product</p>
          <p className="font-medium">{license.productName || "Unnamed Product"}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">License Key</p>
          <p className="font-mono text-xs break-all">{license.licenseKey}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Paid Until</p>
          <p>{license.annualFeePaidUntil || "Never paid"}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Fee Percentage</p>
          <p>{license.annualFeePercent}%</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Status</p>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isOverdue
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isOverdue ? "Overdue" : "Active"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={generateInvoice}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Invoice
        </button>

        {isOverdue && (
          <button
            onClick={markPaid}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Mark Annual Fee Paid
          </button>
        )}
      </div>
    </div>
  );
}
