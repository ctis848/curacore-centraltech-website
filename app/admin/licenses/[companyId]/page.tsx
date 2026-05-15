"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ManageCompany() {
  // ⭐ FIX: Tell TS that params is always an object
  const params = useParams() as Record<string, string>;
  const companyId = params.companyId;

  const [company, setCompany] = useState<any>(null);
  const [adjust, setAdjust] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/licenses/company?id=${companyId}`);
      const data = await res.json();
      setCompany(data);
      setLoading(false);
    }
    load();
  }, [companyId]);

  async function update() {
    await fetch("/api/admin/licenses/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        adjust: Number(adjust),
      }),
    });

    window.location.reload();
  }

  if (loading) return <p className="p-8">Loading…</p>;
  if (!company) return <p className="p-8">Company not found.</p>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">
        Manage {company.name}
      </h1>

      <div className="bg-white shadow rounded-xl p-6">
        <p className="mb-3">
          <strong>Current Licenses:</strong> {company.license_count}
        </p>
        <p className="mb-3">
          <strong>Annual Fee:</strong> ₦{company.annual_price}
        </p>

        <input
          type="number"
          placeholder="Add or remove licenses"
          className="border p-3 w-full mb-4"
          value={adjust}
          onChange={(e) => setAdjust(Number(e.target.value))}
        />

        <button
          onClick={update}
          className="bg-teal-600 text-white p-3 rounded w-full"
        >
          Update Licenses
        </button>
      </div>
    </div>
  );
}
