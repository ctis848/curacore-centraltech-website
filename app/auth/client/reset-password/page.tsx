"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientResetPasswordPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMsg("Unable to update password. Try again.");
    } else {
      setMsg("Password updated successfully.");
      setTimeout(() => router.push("/auth/client/login"), 1500);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">

      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-64 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>
        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Set New Password
        </h1>
      </div>

      {/* FORM CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border">

          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
            Enter Your New Password
          </h2>

          {msg && (
            <p className="text-center text-sm text-blue-700 dark:text-blue-300 mb-4">
              {msg}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-lg font-bold rounded-lg shadow-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
