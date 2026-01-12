// app/portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (use env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserData {
  email: string | undefined;
  plan?: string;
  quantity?: number;
  license_status?: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('No authenticated user found');
          setLoading(false);
          return;
        }

        // Fetch additional user metadata from Supabase (if you have a users table)
        const { data: profile, error: profileError } = await supabase
          .from('profiles') // or 'users' — adjust table name
          .select('plan, quantity, license_status')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserData({
          email: user.email || undefined,
          plan: profile?.plan || 'Starter',
          quantity: profile?.quantity || 1,
          license_status: profile?.license_status || 'active',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup (optional)
    return () => {
      // Any cleanup if needed
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-teal-900">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-teal-50 to-white">
      <h1 className="text-5xl font-black text-teal-900 mb-12 text-center">
        CentralCore Client Dashboard
      </h1>

      {/* Welcome / User Info */}
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <p className="text-2xl text-teal-800">
          Welcome back, {userData?.email || 'User'}
        </p>
        <p className="text-xl text-teal-700 mt-2">
          Current Plan: <strong>{userData?.plan}</strong> • 
          Licenses: <strong>{userData?.quantity}</strong> • 
          Status: <strong className={userData?.license_status === 'active' ? 'text-green-600' : 'text-red-600'}>
            {userData?.license_status?.toUpperCase()}
          </strong>
        </p>
      </div>

      {/* Billing & Invoices Section */}
      <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
          Billing & Invoices
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-teal-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-teal-900 mb-2">Current Plan</h3>
            <p className="text-3xl font-black text-yellow-600">{userData?.plan || 'Starter'}</p>
          </div>
          <div className="bg-teal-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-teal-900 mb-2">Next Billing</h3>
            <p className="text-3xl font-black text-yellow-600">Jan 1, 2026</p>
          </div>
          <div className="bg-teal-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-teal-900 mb-2">Payment Method</h3>
            <p className="text-3xl font-black text-yellow-600">Paystack • ****4242</p>
          </div>
        </div>

        {/* Invoice History Table */}
        <h3 className="text-2xl font-bold text-teal-900 mb-6">Invoice History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-100">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-teal-50">
                <td className="p-4">inv001</td>
                <td className="p-4">2025-01-01</td>
                <td className="p-4">₦15,000</td>
                <td className="p-4 text-green-600 font-medium">Paid</td>
                <td className="p-4">
                  <Link href="#" className="text-teal-600 hover:underline hover:text-teal-800">
                    Download PDF →
                  </Link>
                </td>
              </tr>
              {/* Add more rows dynamically from Supabase later */}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl">
            Manage Billing in Paystack Portal
          </button>
        </div>
      </section>

      {/* Add more dashboard sections here (licenses, users, etc.) */}
    </div>
  );
}