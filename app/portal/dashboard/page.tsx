// app/portal/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface UserProfile {
  email: string | null;
}

interface License {
  id: string;
  user_id: string;
  machine_id?: string | null;
  computer_name?: string;
  computer_details?: string;
  active: boolean;
  revoked_at?: string | null;
  activation_date?: string | null;
  purchase_date?: string | null;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // FIXED LOGOUT HANDLER
  const handleLogout = async () => {
    await supabase.auth.signOut();

    // Hard clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirect to your real login page
    window.location.href = "https://centraltechinformationsystems.com/Portal/Login";
  };

  // FIXED AUTH CHECK USING getSession()
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndFetch = async () => {
      try {
        setLoading(true);

        // The ONLY reliable Supabase auth check
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData?.session) {
          window.location.href = "https://centraltechinformationsystems.com/Portal/Login";
          return;
        }

        const user = sessionData.session.user;

        if (isMounted) {
          setUserProfile({ email: user.email ?? null });
        }

        const { data: licenseData, error: licenseError } = await supabase
          .from("licenses")
          .select("*")
          .eq("user_id", user.id);

        if (licenseError) throw licenseError;

        if (isMounted) {
          setLicenses(licenseData || []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // REVOKE LICENSE
  const handleRevoke = async (licenseId: string | null | undefined) => {
    if (!licenseId) return alert("Invalid license ID");

    if (!confirm("Are you sure you want to revoke this license?")) return;

    try {
      const { error } = await supabase
        .from("licenses")
        .update({
          active: false,
          machine_id: null,
          revoked_at: new Date().toISOString(),
        })
        .eq("id", licenseId);

      if (error) throw error;

      alert("License revoked successfully");

      setLicenses(prev =>
        prev.map(l =>
          l.id === licenseId
            ? { ...l, active: false, machine_id: null, revoked_at: new Date().toISOString() }
            : l
        )
      );
    } catch (err) {
      alert("Revoke failed");
    }
  };

  // REACTIVATE LICENSE
  const handleReactivate = async (licenseId: string | null | undefined) => {
    if (!licenseId) return alert("Invalid license ID");

    const machineIdInput = prompt("Enter new machine ID (or leave blank for auto):");
    if (machineIdInput === null) return;

    const machineId = machineIdInput.trim() || null;

    try {
      const { error } = await supabase
        .from("licenses")
        .update({
          active: true,
          machine_id: machineId,
          revoked_at: null,
          activation_date: new Date().toISOString(),
        })
        .eq("id", licenseId);

      if (error) throw error;

      alert("License reactivated");

      setLicenses(prev =>
        prev.map(l =>
          l.id === licenseId
            ? {
                ...l,
                active: true,
                machine_id: machineId,
                revoked_at: null,
                activation_date: new Date().toISOString(),
              }
            : l
        )
      );
    } catch (err) {
      alert("Reactivation failed");
    }
  };

  // Stats
  const totalPurchased = licenses.length;
  const activeCount = licenses.filter(l => l.active).length;
  const notInUseCount = licenses.filter(l => !l.active && !l.revoked_at).length;
  const activeComputersCount = activeCount;

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-teal-900 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="min-h-screen pt-20 p-8 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-6xl mx-auto">

        {/* Title + Logout */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-teal-900">
            CentralCore Client Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-xl transition shadow-2xl"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-teal-100">
            <h3 className="text-xl font-bold text-teal-900">Purchased Licenses</h3>
            <p className="text-4xl font-black text-yellow-600">{totalPurchased}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-teal-100">
            <h3 className="text-xl font-bold text-teal-900">Active Licenses</h3>
            <p className="text-4xl font-black text-green-600">{activeCount}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-teal-100">
            <h3 className="text-xl font-bold text-teal-900">Not in Use</h3>
            <p className="text-4xl font-black text-orange-600">{notInUseCount}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center border border-teal-100">
            <h3 className="text-xl font-bold text-teal-900">Active Computers</h3>
            <p className="text-4xl font-black text-teal-600">{activeComputersCount}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-teal-100 mb-12 text-center">
          <h2 className="text-3xl font-bold text-teal-900 mb-6">Welcome Back</h2>
          <p className="text-xl text-teal-800 mb-4">
            Email: <strong>{userProfile?.email || "Not available"}</strong>
          </p>
        </div>

        {/* License Management */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100 mb-12">
          <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
            License & Computer Management
          </h2>

          {licenses.length === 0 ? (
            <p className="text-gray-600 text-center text-lg">
              No licenses found yet. Purchase a plan to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-100">
                    <th className="p-4">License ID</th>
                    <th className="p-4">Computer Name</th>
                    <th className="p-4">Machine ID / Address</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {licenses.map(l => (
                    <tr key={l.id} className="border-b hover:bg-teal-50">
                      <td className="p-4 font-mono">{l.id.slice(0, 8)}...</td>
                      <td className="p-4">{l.computer_name || "—"}</td>
                      <td className="p-4 font-mono">{l.machine_id || "—"}</td>
                      <td className="p-4">{l.computer_details || "—"}</td>

                      <td className="p-4">
                        {l.revoked_at ? (
                          <span className="text-red-600 font-medium">Revoked</span>
                        ) : l.active ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-orange-600 font-medium">Not in Use</span>
                        )}
                      </td>

                      <td className="p-4 flex gap-2">
                        {l.active && (
                          <button
                            onClick={() => handleRevoke(l.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                          >
                            Revoke
                          </button>
                        )}

                        {l.revoked_at && (
                          <button
                            onClick={() => handleReactivate(l.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Billing */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100">
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
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl">
              Manage Billing in Paystack Portal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}