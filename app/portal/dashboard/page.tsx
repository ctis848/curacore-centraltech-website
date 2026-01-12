// app/portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase client (safe env var access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
interface UserProfile {
  email: string | null;
}

interface License {
  id: string;
  active: boolean;
  machine_id?: string | null;
  machine_details?: string;
  activation_date?: string;
  user_email: string;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeLicenses, setActiveLicenses] = useState<License[]>([]);
  const [nonActiveLicenses, setNonActiveLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('No authenticated user found');
        }

        if (isMounted) {
          setUserProfile({
            email: user.email ?? null,
          });
        }

        // Fetch licenses
        const { data: licenses, error: licenseError } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_email', user.email ?? '');

        if (licenseError) throw licenseError;

        if (isMounted) {
          setActiveLicenses(licenses?.filter((l: License) => l.active) || []);
          setNonActiveLicenses(licenses?.filter((l: License) => !l.active) || []);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRevoke = async (licenseId: string, machineId: string | null) => {
    if (!confirm('Are you sure you want to revoke this license?')) return;

    try {
      const { error } = await supabase
        .from('licenses')
        .update({ 
          active: false, 
          machine_id: null, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', licenseId);

      if (error) throw error;

      alert('License revoked successfully');

      setActiveLicenses((prev) => prev.filter((l) => l.id !== licenseId));
      
      setNonActiveLicenses((prev) => [
        ...prev,
        { 
          id: licenseId, 
          active: false, 
          user_email: userProfile?.email || '',
          machine_id: null,
        } as License,
      ]);
    } catch (err: unknown) {
      alert('Revoke failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleActivate = async (licenseId: string) => {
    const machineIdInput = prompt('Enter new machine ID (or leave blank for auto):');
    if (machineIdInput === null) return;

    const machineId = machineIdInput.trim() || null;

    try {
      const { error } = await supabase
        .from('licenses')
        .update({
          active: true,
          machine_id: machineId,
          activation_date: new Date().toISOString(),
        })
        .eq('id', licenseId);

      if (error) throw error;

      alert('License activated successfully');

      setNonActiveLicenses((prev) => prev.filter((l) => l.id !== licenseId));

      setActiveLicenses((prev) => [
        ...prev,
        { 
          id: licenseId, 
          active: true, 
          machine_id: machineId,
          user_email: userProfile?.email || '',
          activation_date: new Date().toISOString(),
        } as License,
      ]);
    } catch (err: unknown) {
      alert('Activation failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-teal-900 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 p-8 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-12 text-center">
          CentralCore Client Dashboard
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-teal-100 mb-12 text-center">
          <h2 className="text-3xl font-bold text-teal-900 mb-6">Welcome Back</h2>
          <p className="text-xl text-teal-800 mb-4">
            Email: <strong>{userProfile?.email || 'Not available'}</strong>
          </p>
        </div>

        {/* Billing & Invoices */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100 mb-12">
          <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
            Billing & Invoices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-teal-50 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-teal-900 mb-2">Current Plan</h3>
              <p className="text-3xl font-black text-yellow-600">Starter</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-teal-900 mb-2">Next Billing</h3>
              <p className="text-3xl font-black text-yellow-600">Jan 1, 2026</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-teal-900 mb-2">Payment Method</h3>
              <p className="text-3xl font-black text-yellow-600">****4242</p>
            </div>
          </div>

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
                {/* Add more rows dynamically */}
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl">
              Manage Billing in Paystack Portal
            </button>
          </div>
        </section>

        {/* License Management Section */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100">
          <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
            License Management
          </h2>

          {/* Active Licenses */}
          <h3 className="text-2xl font-bold text-teal-900 mb-4">Active Licenses</h3>
          {activeLicenses.length === 0 ? (
            <p className="text-gray-600 mb-6">No active licenses yet.</p>
          ) : (
            <div className="overflow-x-auto mb-12">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-100">
                    <th className="p-4">Machine Details</th>
                    <th className="p-4">Activation Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLicenses.map((l) => {
                    // Guard against undefined or null id
                    if (!l.id) return null;

                    return (
                      <tr key={l.id} className="border-b hover:bg-teal-50">
                        <td className="p-4">{l.machine_details || l.machine_id || '—'}</td>
                        <td className="p-4">
                          {l.activation_date ? new Date(l.activation_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4 text-green-600 font-medium">Active</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleRevoke(l.id, l.machine_id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Non-Active Licenses */}
          <h3 className="text-2xl font-bold text-teal-900 mb-4">Non-Active Licenses</h3>
          {nonActiveLicenses.length === 0 ? (
            <p className="text-gray-600">No available licenses to activate.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-100">
                    <th className="p-4">License ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {nonActiveLicenses.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-teal-50">
                      <td className="p-4">{l.id}</td>
                      <td className="p-4 text-gray-600 font-medium">Non-Active</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleActivate(l.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
        </section>
      </div>
    </div>
  );
}