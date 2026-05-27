"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function ClientEmailVerificationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">

      {/* ⭐ HOMEPAGE NAVBAR */}
      <Navbar />

      {/* ⭐ HERO SECTION */}
      <div className="relative w-full h-64 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>

        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Email Verified
        </h1>
      </div>

      {/* ⭐ SUCCESS CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-200 dark:border-gray-700 text-center">

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Your Email Has Been Verified
          </h2>

          <p className="text-slate-600 dark:text-gray-300 mb-6">
            Your account is now active. You can log in and start using your client portal.
          </p>

          <button
            onClick={() => router.push("/auth/client/login")}
            className="w-full py-3 text-lg font-bold rounded-lg shadow-lg bg-teal-600 hover:bg-teal-700 text-white transition"
          >
            Go to Login
          </button>
        </div>
      </main>
    </div>
  );
}
