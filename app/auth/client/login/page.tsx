"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar"; // ⭐ Replaced PublicNavbar
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientLogin() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMsg("Invalid email or password");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMsg("Authentication failed");
        setLoading(false);
        return;
      }

      router.push("/client");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">

      {/* ⭐ HOMEPAGE NAVBAR */}
      <Navbar />

      {/* ⭐ HERO SECTION */}
      <div className="relative w-full h-64 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>

        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Client Portal Login
        </h1>
      </div>

      {/* ⭐ LOGIN CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-200 dark:border-gray-700">

          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
            Welcome Back
          </h2>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/auth/client/forgot-password")}
                className="text-sm text-teal-600 dark:text-teal-300 hover:underline"
              >
                Forgot password
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-lg font-bold rounded-lg shadow-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <p className="text-center text-sm text-slate-600 dark:text-gray-300 mt-4">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/client/signup")}
              className="text-teal-600 dark:text-teal-300 hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
