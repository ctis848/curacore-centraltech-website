// app/super-admin/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'super-admin') {
        router.push('/portal/login');
        return;
      }
      setUser(user);

      const res = await fetch('/api/list-users');
      const { users } = await res.json();
      setAdmins(users.filter((u: any) => u.user_metadata?.role === 'admin'));
      setAllUsers(users.filter((u: any) => u.user_metadata?.role === 'user'));

      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setCreating(true);

    const res = await fetch('/api/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail.trim() }),
    });
    const data = await res.json();

    if (data.error) {
      alert('Failed: ' + data.error);
    } else {
      alert(`Admin created successfully!\nEmail: ${newAdminEmail}\nPassword: ${data.password}`);
      setNewAdminEmail('');
      const res2 = await fetch('/api/list-users');
      const { users } = await res2.json();
      setAdmins(users.filter((u: any) => u.user_metadata?.role === 'admin'));
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-3xl font-bold text-teal-900">Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-teal-900 text-center mb-16">
            Super Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Manage Admins */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-teal-100">
              <h2 className="text-4xl font-black text-teal-900 mb-8 text-center">
                Manage Admins
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 mb-12 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter new admin email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition"
                />
                <button
                  onClick={handleCreateAdmin}
                  disabled={creating}
                  className="bg-yellow-400 text-teal-900 px-12 py-5 rounded-xl text-xl font-bold hover:bg-yellow-300 disabled:opacity-60 transition shadow-lg"
                >
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-4 border-teal-300">
                    <tr>
                      <th className="py-6 text-teal-900 font-bold text-lg">Email</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">Created On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-12 text-center text-gray-500 text-xl">
                          No admins yet.
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                          <td className="py-6 font-medium text-gray-800">{admin.email}</td>
                          <td className="py-6 text-gray-600">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Users Overview */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-teal-100">
              <h2 className="text-4xl font-black text-teal-900 mb-8 text-center">
                All Customer Accounts
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-4 border-teal-300">
                    <tr>
                      <th className="py-6 text-teal-900 font-bold text-lg">Email</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">Plan</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-500 text-xl">
                          No customer accounts yet.
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((u) => (
                        <tr key={u.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                          <td className="py-6 font-medium text-gray-800">{u.email}</td>
                          <td className="py-6 font-semibold text-teal-700">
                            {u.user_metadata?.plan || 'Starter'}
                          </td>
                          <td className="py-6">{u.user_metadata?.quantity || 1}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}