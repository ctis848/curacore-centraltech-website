// app/admin/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || (data.user.user_metadata.role !== 'admin' && data.user.user_metadata.role !== 'super-admin')) {
        router.push('/portal/login');
      } else {
        setUser(data.user);
        const { data: userData } = await supabase.auth.admin.listUsers();
        setUsers(userData.users.filter(u => u.user_metadata.role === 'user'));
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl">Loading Admin Dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-blue-900 mb-12 text-center">
          Admin Dashboard
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Manage Users</h2>
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="py-4">Email</th>
                <th className="py-4">Plan</th>
                <th className="py-4">Licenses</th>
                <th className="py-4">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-4">{u.email}</td>
                  <td className="py-4">{u.user_metadata.plan}</td>
                  <td className="py-4">{u.user_metadata.quantity}</td>
                  <td className="py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}