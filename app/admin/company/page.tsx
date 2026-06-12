"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  license_count: number;
  renewal_date: string | null;
  annual_price: number;
  created_at: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/companies");
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load companies");
        setLoading(false);
        return;
      }

      setCompanies(json.companies || []);
      setLoading(false);
    } catch (err) {
      console.error("Companies load error:", err);
      setError("Unexpected error loading companies");
      setLoading(false);
    }
  }

  const getStatusBadge = (company: Company) => {
    if (!company.renewal_date) return "bg-slate-200 text-slate-700";

    const today = new Date();
    const renewal = new Date(company.renewal_date);

    if (renewal < today) return "bg-red-100 text-red-700 border-red-300";

    const diff = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 14) return "bg-amber-100 text-amber-700 border-amber-300";

    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  };

  if (error) {
    return (
      <div className="p-6 text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Companies
      </h1>

      {loading ? (
        <p className="text-slate-600">Loading companies…</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Company</th>
                <th className="px-4 py-3 text-left font-semibold">Licenses</th>
                <th className="px-4 py-3 text-left font-semibold">Renewal Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium">{c.name}</td>

                  <td className="px-4 py-3">{c.license_count}</td>

                  <td className="px-4 py-3">
                    {c.renewal_date
                      ? new Date(c.renewal_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${getStatusBadge(
                        c
                      )}`}
                    >
                      {c.renewal_date
                        ? new Date(c.renewal_date) < new Date()
                          ? "Overdue"
                          : "Active"
                        : "Unknown"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/company/${c.id}/machines`}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Machines
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
