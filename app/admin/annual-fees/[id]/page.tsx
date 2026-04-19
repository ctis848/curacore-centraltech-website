"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { LicenseRow } from "@/types/admin";

interface PageProps {
  params: { id: string };
}

export default function AnnualFeeDetails({ params }: PageProps) {
  const supabase = supabaseBrowser();
  const [license, setLicense] = useState<LicenseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;

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

  if (loading) return <p>Loading...</p>;
  if (!license) return <p>License not found.</p>;

  const now = new Date();
  const paidUntil = license.annualFeePaidUntil
    ? new Date(license.annualFeePaidUntil)
    : null;

  const isOverdue = paidUntil ? paidUntil < now : true;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Annual Fee</h1>

      <div className="bg-white border rounded p-4 space-y-2">
        <p><strong>Product:</strong> {license.productName}</p>
        <p><strong>Paid Until:</strong> {license.annualFeePaidUntil}</p>
        <p><strong>Fee %:</strong> {license.annualFeePercent}%</p>
      </div>

      <div className="mt-4 space-x-3">
        <button
          onClick={generateInvoice}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Generate Invoice
        </button>

        {isOverdue && (
          <button
            onClick={markPaid}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Mark Annual Fee Paid
          </button>
        )}
      </div>
    </div>
  );
}
