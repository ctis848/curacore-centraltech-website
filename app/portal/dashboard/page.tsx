// app/portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeLicenses, setActiveLicenses] = useState<any[]>([]);
  const [nonActiveLicenses, setNonActiveLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data: licenses } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id);

      setActiveLicenses(licenses?.filter(l => l.active) || []);
      setNonActiveLicenses(licenses?.filter(l => !l.active) || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRevoke = async (licenseId: string) => {
    if (!confirm('Revoke this license?')) return;

    const { error } = await supabase
      .from('licenses')
      .update({ active: false, machine_id: null })
      .eq('id', licenseId);

    if (error) {
      alert('Revoke failed: ' + error.message);
    } else {
      alert('License revoked successfully');
      // Refresh list
      setActiveLicenses(prev => prev.filter(l => l.id !== licenseId));
    }
  };

  const handleActivate = async (licenseId: string, newMachineId: string) => {
    // In real app, get machineId from client device fingerprint
    const { error } = await supabase
      .from('licenses')
      .update({
        active: true,
        machine_id: newMachineId,
        activated_at: new Date().toISOString(),
      })
      .eq('id', licenseId);

    if (error) {
      alert('Activation failed: ' + error.message);
    } else {
      alert('License activated on new computer');
      // Refresh list
      setNonActiveLicenses(prev => prev.filter(l => l.id !== licenseId));
      setActiveLicenses(prev => [...prev, { id: licenseId, machine_id: newMachineId }]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-teal-900 mb-12 text-center">
          CentralCore Client Dashboard
        </h1>

        {/* License Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-teal-900 mb-8">License Management</h2>

          {/* Active Licenses */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-teal-900 mb-4">Active Licenses</h3>
            {activeLicenses.length === 0 ? (
              <p className="text-gray-600">No active licenses yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-teal-100">
                      <th className="p-4">License ID</th>
                      <th className="p-4">Machine ID</th>
                      <th className="p-4">Activated</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLicenses.map(l => (
                      <tr key={l.id} className="border-b">
                        <td className="p-4">{l.id}</td>
                        <td className="p-4">{l.machine_id || '—'}</td>
                        <td className="p-4">{l.activated_at ? new Date(l.activated_at).toLocaleDateString() : '—'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleRevoke(l.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Non-Active / Available Licenses */}
          <div>
            <h3 className="text-2xl font-bold text-teal-900 mb-4">Purchased Non-Active Licenses</h3>
            {nonActiveLicenses.length === 0 ? (
              <p className="text-gray-600">No available licenses.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-teal-100">
                      <th className="p-4">License ID</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonActiveLicenses.map(l => (
                      <tr key={l.id} className="border-b">
                        <td className="p-4">{l.id}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleActivate(l.id, 'new-machine-id-placeholder')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          >
                            Activate on New Computer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}