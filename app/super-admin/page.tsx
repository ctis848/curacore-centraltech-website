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
  const [users, setUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.user_metadata.role !== 'super-admin') {
        router.push('/portal/login');
      } else {
        setUser(data.user);
        // Get admins
        const { data: adminData } = await supabase.auth.admin.listUsers();
        setAdmins(adminData.users.filter(u => u.user_metadata.role === 'admin'));
        // Get users
        setUsers(adminData.users.filter(u => u.user_metadata.role === 'user'));
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) return;

    const randomPassword = Math.random().toString(36).slice(-12);
    const { error } = await supabase.auth.admin.createUser({
      email: newAdminEmail,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (error) {
      alert('Failed to create admin: ' + error.message);
    } else {
      alert('Admin created successfully! Password: ' + randomPassword);
      setNewAdminEmail('');
      // Refresh admins
      const { data: adminData } = await supabase.auth.admin.listUsers();
      setAdmins(adminData.users.filter(u => u.user_metadata.role === 'admin'));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl">Loading Super Admin Dashboard...</p></div>;
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
                className="bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-700"
              >
                Create Admin
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
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-4">{u.email}</td>
                    <td className="py-4">{u.user_metadata.role}</td>
                    <td className="py-4">{u.user_metadata.quantity}</td>
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