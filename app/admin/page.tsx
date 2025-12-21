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
      if (!data.user || !['admin', 'super-admin'].includes(data.user.user_metadata.role)) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-3xl font-bold text-teal-900">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-teal-900 text-center mb-16">
            Admin Dashboard
          </h1>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-teal-100">
            <h2 className="text-4xl font-black text-teal-900 mb-10 text-center">
              Manage Customer Accounts
            </h2>

            {users.length === 0 ? (
              <p className="text-center text-gray-500 text-xl py-12">
                No customer accounts found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-4 border-teal-300">
                    <tr>
                      <th className="py-6 text-teal-900 font-bold text-lg">Email</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">Plan</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">License Seats</th>
                      <th className="py-6 text-teal-900 font-bold text-lg">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                        <td className="py-6 font-medium text-gray-800">{u.email}</td>
                        <td className="py-6 font-semibold text-teal-700">
                          {u.user_metadata.plan || 'Starter'}
                        </td>
                        <td className="py-6">{u.user_metadata.quantity || 1}</td>
                        <td className="py-6 text-gray-600">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}