// app/portal/dashboard/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/portal/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/portal/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const plan = user.user_metadata?.plan || 'Starter';
  const quantity = user.user_metadata?.quantity || '1';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-blue-900">
            Welcome back, {user.email}!
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/portal/login');
            }}
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <p className="text-xl text-gray-700 mb-12">Your CuraCore EMR license is active.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
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

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Total Licenses</h2>
            <p className="text-5xl font-black text-green-600">{quantity}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="https://your-desktop-app-download-link.com" // Replace with real link
              className="bg-blue-900 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-800 text-center block"
            >
              Download Desktop App
            </a>
            <a
              href="/buy"
              className="bg-green-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-700 text-center block"
            >
              Upgrade Plan
            </a>
            <a
              href="https://billing.stripe.com/p/login/your-customer-portal-link" // Replace with Stripe customer portal link
              className="bg-gray-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-gray-700 text-center block"
            >
              View Invoices
            </a>
            <a
              href="/support"
              className="bg-yellow-500 text-blue-900 py-4 rounded-xl text-xl font-bold hover:bg-yellow-400 text-center block"
            >
              Contact Support
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/products"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-700 inline-block"
          >
            Explore CuraCore EMR
          </a>
        </div>
      </div>
    </div>
  );
}