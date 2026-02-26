// app/admin/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin access
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    role?: string;
    plan?: string;
    quantity?: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current logged-in user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        const role = authUser.user_metadata?.role;

        if (!['admin', 'super-admin'].includes(role)) {
          setError('Access denied: Admin privileges required');
          router.push('/dashboard');
          return;
        }

        setUser(authUser as User);

        // List all users (admin only)
        const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) throw listError;

        // Filter only regular users (exclude admins)
        const filteredUsers = (userList.users || []).filter(
          (u: any) => u.user_metadata?.role === 'user'
        );

        setUsers(filteredUsers as User[]);
      } catch (err: unknown) {
        console.error('Admin dashboard error:', err);
        setError('Failed to load admin dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center">
          <p className="text-3xl font-bold text-teal-900 animate-pulse">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <p className="text-2xl font-bold text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <header className="bg-teal-900 text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-black">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-teal-100">
          <h2 className="text-4xl font-black text-teal-900 mb-10 text-center">
            Manage Customer Accounts
          </h2>

          {users.length === 0 ? (
            <p className="text-center text-gray-600 text-xl py-12">
              No customer accounts found at this time.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-teal-200">
              <table className="w-full text-left">
                <thead className="bg-teal-900 text-white">
                  <tr>
                    <th className="py-5 px-6 font-bold text-lg">Email</th>
                    <th className="py-5 px-6 font-bold text-lg">Plan</th>
                    <th className="py-5 px-6 font-bold text-lg">License Seats</th>
                    <th className="py-5 px-6 font-bold text-lg">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                      <td className="py-5 px-6 font-medium text-gray-800">{u.email || 'N/A'}</td>
                      <td className="py-5 px-6 font-semibold text-teal-700">
                        {u.user_metadata?.plan || 'Starter'}
                      </td>
                      <td className="py-5 px-6 text-gray-800">
                        {u.user_metadata?.quantity || 1}
                      </td>
                      <td className="py-5 px-6 text-gray-600">
                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}