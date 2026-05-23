"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  license_count: number;
  annual_price: number;
  renewal_date: string | null;
}

export default function AdminLicenseManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCompanies() {
    setLoading(true);

    const res = await fetch("/api/admin/licenses/list");
    const data = await res.json();

    setCompanies(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">
          License Management Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Overview of companies, license counts, annual fees, and renewal cycles.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-slate-600 text-sm">Loading companies…</p>
      )}

      {/* EMPTY STATE */}
      {!loading && companies.length === 0 && (
        <p className="text-slate-500 text-sm">No companies found.</p>
      )}

      {/* TABLE */}
      {!loading && companies.length > 0 && (
        <div className="overflow-x-auto border rounded-2xl bg-white shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Company</th>
                <th className="px-5 py-3 text-left font-semibold">Licenses</th>
                <th className="px-5 py-3 text-left font-semibold">Annual Fee</th>
                <th className="px-5 py-3 text-left font-semibold">Renewal Date</th>
                <th className="px-5 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {c.name}
                  </td>

                  <td className="px-5 py-3 text-slate-700">
                    {c.license_count}
                  </td>

                  <td className="px-5 py-3 text-emerald-700 font-semibold">
                    ₦{Number(c.annual_price).toLocaleString()}
                  </td>

                  <td className="px-5 py-3 text-slate-700">
                    {c.renewal_date
                      ? new Date(c.renewal_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/licenses/${c.id}`}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-semibold shadow hover:brightness-110"
                    >
                      Manage
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
