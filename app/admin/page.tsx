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
      const { data: { user } } = await supabase.auth.getUser();

      // Not logged in → redirect
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Only CTIS admin allowed
      if (user.email !== "info@ctistech.com") {
        router.push("/dashboard");
        return;
      }

      setAuthUser(user);
      setLoading(false);
    }

    load();
  }, []);

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

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
            Welcome, CTIS Administrator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="/admin/requests"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Activation Requests</h3>
              <p className="text-gray-600">View and approve pending license requests.</p>
            </a>

            <a
              href="/admin/licenses"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Create License</h3>
              <p className="text-gray-600">Generate and assign licenses to clients.</p>
            </a>

            <a
              href="/dashboard"
              className="p-8 bg-gray-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <h3 className="text-xl font-bold mb-3">Client Portal</h3>
              <p className="text-gray-600">Return to the client dashboard.</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
