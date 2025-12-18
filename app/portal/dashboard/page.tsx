// app/portal/dashboard/page.tsx
'use client';

import { useUser } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/portal/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const plan = user.user_metadata?.plan || 'Starter';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-blue-900 mb-4">
          Welcome back, {user.email}!
        </h1>
        <p className="text-xl text-gray-700 mb-12">Your CuraCore EMR license is active.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Current Plan</h2>
            <p className="text-5xl font-black text-green-600">{plan}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Status</h2>
            <p className="text-4xl font-bold text-green-600">Active</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Billing</h2>
            <p className="text-3xl font-bold">{plan === 'Lifetime' ? 'One-time' : 'Monthly'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="bg-blue-900 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-800">
              Download Desktop App
            </button>
            <button className="bg-green-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-700">
              Upgrade Plan
            </button>
            <button className="bg-gray-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-gray-700">
              View Invoices
            </button>
            <button className="bg-yellow-500 text-blue-900 py-4 rounded-xl text-xl font-bold hover:bg-yellow-400">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}