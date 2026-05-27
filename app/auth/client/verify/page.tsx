"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientEmailVerificationPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const searchParams = useSearchParams();

  // ⭐ FIX: Prevent "possibly null" error
  const email = searchParams?.get("email") ?? "";

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // ⭐ FIX: Supabase requires email + token + type
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token: code,
      email,
    });

    if (error) {
      setMsg("Invalid or expired verification code.");
      setLoading(false);
      return;
    }

    setMsg("Email verified successfully.");
    setTimeout(() => router.push("/auth/client/login"), 1500);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">

      {/* ⭐ HOMEPAGE NAVBAR */}
      <Navbar />

      {/* ⭐ HERO SECTION */}
      <div className="relative w-full h-64 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>

        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Verify Your Email
        </h1>
      </div>

      {/* ⭐ VERIFICATION CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-200 dark:border-gray-700">

          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
            Enter Verification Code
          </h2>

          <p className="text-center text-sm text-slate-600 dark:text-gray-300 mb-4">
            We sent a 6‑digit verification code to <strong>{email}</strong>.
          </p>

          {msg && (
            <p className="text-center text-sm text-blue-700 dark:text-blue-300 mb-4">
              {msg}
            </p>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 tracking-widest text-center text-lg"
                value={code}
                onChange={(e) => setCode(e.target.value)}
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
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-gray-300 mt-4">
            Didn’t receive the code?
            <button
              type="button"
              onClick={() => router.refresh()}
              className="text-teal-600 dark:text-teal-300 hover:underline ml-1"
            >
              Resend
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
