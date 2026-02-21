// app/portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase client (use environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activation form state
  const [requestKey, setRequestKey] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    // Clear all storage and cookies
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirect to login on new domain (relative path is better)
    window.location.href = '/portal/login';
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = '/portal/login';
          return;
        }

        const user = session.user;

        if (mounted) {
          setUserProfile({ email: user.email ?? null });
        }

        const { data: licenseData, error: licenseError } = await supabase
          .from("licenses")
          .select("*")
          .eq("user_id", user.id);

        if (licenseError) throw licenseError;

        if (mounted) {
          setLicenses(licenseData || []);
        }
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        if (mounted) setError("Failed to load dashboard. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this license?")) return;

    const { error } = await supabase
      .from("licenses")
      .update({
        active: false,
        machine_id: null,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Failed to revoke license: " + error.message);
      return;
    }

    setLicenses((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, active: false, machine_id: null, revoked_at: new Date().toISOString() } : l
      )
    );
  };

  const handleReactivate = async (id: string) => {
    const machineId = prompt("Enter new machine ID (optional):")?.trim() || null;

    const { error } = await supabase
      .from("licenses")
      .update({
        active: true,
        machine_id: machineId,
        revoked_at: null,
        activation_date: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Failed to reactivate: " + error.message);
      return;
    }

    setLicenses((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, active: true, machine_id: machineId, revoked_at: null } : l
      )
    );
  };

  // Handle activation form submission
  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestKey.trim()) {
      setActivationError("Please enter a valid Request Key");
      return;
    }

    setIsGenerating(true);
    setActivationError(null);
    setGeneratedKey('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session expired. Please log in again.");
      }

      const accessToken = session.access_token;

      // Call your Supabase Edge Function (replace YOUR_PROJECT_REF with your actual ref)
      const response = await fetch('https://sbd.publishable.6niXnGArkuhI_FroqMRy0w_zwDDsJjd.supabase.co/functions/v1/generate-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ requestKey }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const data = await response.json();

      if (!data.licenseKey) {
        throw new Error("No license key returned from server");
      }

      setGeneratedKey(data.licenseKey);
      alert("Success! Copy the license key and paste it into your desktop app.");

      // Refresh license list
      const { data: updated } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", session.user.id);

      if (updated) setLicenses(updated);
    } catch (err: any) {
      setActivationError(err.message || "Something went wrong");
      console.error("Activation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-2xl text-teal-900 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-2xl text-red-600">{error}</p>
      </div>
    );
  }

  const totalPurchased = licenses.length;
  const activeCount = licenses.filter((l) => l.active).length;
  const notInUseCount = licenses.filter((l) => !l.active && !l.revoked_at).length;
  const activeComputersCount = activeCount;

  return (
    <div className="min-h-screen pt-20 p-8 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-black text-teal-900">CentralCore Client Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
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
            Email: <strong>{userProfile?.email}</strong>
          </p>
        </div>

        {/* === Activate New Computer Form === */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100 mb-12">
          <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
            Activate New Computer
          </h2>

          <p className="text-center text-gray-700 mb-6 text-lg">
            Open CentralCore EMR on your computer. Copy the <strong>Request Key</strong> shown on screen and paste it below to generate your license key.
          </p>

          <form onSubmit={handleGenerateLicense} className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Paste Request Key here..."
              value={requestKey}
              onChange={(e) => setRequestKey(e.target.value.trim())}
              className="w-full p-5 border-2 border-teal-300 rounded-full mb-6 text-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              disabled={isGenerating}
            />

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-teal-900 py-5 rounded-full text-xl font-bold transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating License Key...' : 'Generate License Key'}
            </button>
          </form>

          {activationError && (
            <p className="text-red-600 text-center mt-6 font-medium">{activationError}</p>
          )}

          {generatedKey && (
            <div className="mt-10 text-center">
              <p className="text-2xl font-bold text-green-700 mb-4">
                License Key Generated Successfully!
              </p>
              <div className="bg-teal-50 border border-teal-200 p-6 rounded-2xl inline-block max-w-full">
                <p className="text-3xl font-mono break-all select-all mb-6">
                  {generatedKey}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    alert('License key copied to clipboard!');
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-10 py-4 rounded-full transition font-bold"
                >
                  Copy License Key
                </button>
              </div>
              <p className="mt-6 text-gray-700">
                Paste this key into the CentralCore EMR desktop app to complete activation.
              </p>
            </div>
          )}
        </section>

        {/* License & Computer Management */}
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
                    <th className="p-4">Machine ID</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l) => (
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
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                          >
                            Revoke
                          </button>
                        )}
                        {l.revoked_at && (
                          <button
                            onClick={() => handleReactivate(l.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
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

        {/* Billing & Invoices */}
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
                    <Link href="#" className="text-teal-600 hover:underline">
                      Download PDF →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 shadow-2xl">
              Manage Billing in Paystack Portal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}