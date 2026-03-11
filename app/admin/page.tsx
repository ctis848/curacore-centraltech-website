"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Not logged in → redirect
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Role-based admin check
      if (user.user_metadata.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      setAuthUser(user);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-2xl font-bold text-gray-700 animate-pulse">
          Loading Admin Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-black">CTIS Admin Portal</h1>

          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
            Welcome, Administrator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Activation Requests */}
            <a
              href="/admin/activation-requests"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Activation Requests</h3>
              <p className="text-gray-600">
                View all license activation requests submitted by clients.
              </p>
            </a>

            {/* License Management */}
            <a
              href="/admin/licenses"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">License Management</h3>
              <p className="text-gray-600">
                View, manage, assign, revoke, and resend licenses.
              </p>
            </a>

            {/* License Generator */}
            <a
              href="/admin/licenses/generate"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Generate License</h3>
              <p className="text-gray-600">
                Create new licenses manually for clients.
              </p>
            </a>

            {/* Machine Logs */}
            <a
              href="/admin/machines"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Machine Logs</h3>
              <p className="text-gray-600">
                View machine activations and binding history.
              </p>
            </a>

            {/* Client Portal */}
            <a
              href="/dashboard"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Client Portal</h3>
              <p className="text-gray-600">
                Switch back to the client dashboard.
              </p>
            </a>

            {/* System Settings */}
            <a
              href="/admin/settings"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">System Settings</h3>
              <p className="text-gray-600">
                Configure admin roles, license defaults, and system behavior.
              </p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
