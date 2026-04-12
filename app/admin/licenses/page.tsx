"use client";

import { useEffect, useState } from "react";

export default function LicensesListPage() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/licenses", { cache: "no-store" });
      const data = await res.json();
      setLicenses(data.licenses || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Licenses</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">License Key</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l: any) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{l.user_email}</td>
                <td className="p-3">{l.product_name}</td>
                <td className="p-3">{l.license_key}</td>
                <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}

            {licenses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No licenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
