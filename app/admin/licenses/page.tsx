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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">
        License Management Dashboard
      </h1>

      {loading && <p>Loading companies…</p>}

      {!loading && companies.length === 0 && (
        <p className="text-slate-500">No companies found.</p>
      )}

      {!loading && companies.length > 0 && (
        <div className="overflow-x-auto border rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Licenses</th>
                <th className="px-4 py-2 text-left">Annual Fee</th>
                <th className="px-4 py-2 text-left">Renewal Date</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.license_count}</td>
                  <td className="px-4 py-2">₦{c.annual_price}</td>
                  <td className="px-4 py-2">
                    {c.renewal_date ? new Date(c.renewal_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/licenses/${c.id}`}
                      className="text-teal-600 underline"
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
