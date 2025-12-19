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

      // Fetch users from server API
      const res = await fetch('/api/list-users');
      const { users } = await res.json();
      setAdmins(users.filter((u: any) => u.user_metadata?.role === 'admin'));
      setAllUsers(users.filter((u: any) => u.user_metadata?.role === 'user'));
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) return;
    setCreating(true);

    const res = await fetch('/api/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail }),
    });

    const data = await res.json();

    if (data.error) {
      alert('Failed: ' + data.error);
    } else {
      alert(`Admin created! Password: ${data.password}`);
      setNewAdminEmail('');
      // Refresh list
      const res2 = await fetch('/api/list-users');
      const { users } = await res2.json();
      setAdmins(users.filter((u: any) => u.user_metadata?.role === 'admin'));
    }
    setCreating(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-blue-900 mb-12 text-center">
          Super Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Manage Admins</h2>
            <div className="flex gap-4 mb-8">
              <input
                type="email"
                placeholder="New admin email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="flex-1 px-6 py-4 border border-gray-300 rounded-xl text-lg"
              />
              <button
                onClick={handleCreateAdmin}
                disabled={creating}
                className="bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-700 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="py-4">Email</th>
                  <th className="py-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b">
                    <td className="py-4">{admin.email}</td>
                    <td className="py-4">{new Date(admin.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">All Users</h2>
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="py-4">Email</th>
                  <th className="py-4">Role</th>
                  <th className="py-4">Licenses</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-4">{u.email}</td>
                    <td className="py-4">{u.user_metadata?.role || 'user'}</td>
                    <td className="py-4">{u.user_metadata?.quantity || '1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}