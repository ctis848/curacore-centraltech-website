'use client';

import { useEffect, useState } from 'react';

export default function LicenseHistoryPage() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadLicenses() {
    setLoading(true);

    // Fetch logged-in user from Supabase Auth (client-side)
    const userRes = await fetch('/api/auth/me');
    const user = await userRes.json();

    if (!user?.id) {
      setLicenses([]);
      setLoading(false);
      return;
    }

    // Fetch license history
    const res = await fetch(`/api/my-licenses?user_id=${user.id}`);
    const data = await res.json();

    setLicenses(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadLicenses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-10 py-20">
      <div className="max-w-5xl mx-auto space-y-12">

        <h1 className="text-4xl md:text-5xl font-black text-teal-800">
          License History
        </h1>

        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200">

          {loading ? (
            <p className="text-gray-700 text-lg">Loading licenses...</p>
          ) : licenses.length === 0 ? (
            <p className="text-gray-700 text-lg">
              No licenses found. Once your license is approved, it will appear here.
            </p>
          ) : (
            <div className="space-y-6">
              {licenses.map((lic: any) => (
                <div
                  key={lic.id}
                  className="p-6 bg-gray-100 rounded-xl border border-teal-200 shadow-sm"
                >
                  <p className="text-lg">
                    <strong className="text-teal-800">License Key:</strong><br />
                    <span className="font-mono text-xl">{lic.license_key}</span>
                  </p>

                  <p className="mt-3">
                    <strong className="text-teal-800">Plan:</strong> {lic.plan}
                  </p>

                  <p className="mt-1">
                    <strong className="text-teal-800">Status:</strong>{' '}
                    <span
                      className={
                        lic.status === 'active'
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {lic.status}
                    </span>
                  </p>

                  <p className="mt-1 text-gray-700">
                    <strong className="text-teal-800">Issued On:</strong>{' '}
                    {new Date(lic.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
