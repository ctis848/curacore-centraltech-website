"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar"; // ⭐ Replaced PublicNavbar
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(e.target);
    const company_name = form.get("company_name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    // 1️⃣ Create user
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setMessage(signupError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Login immediately
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setMessage("Signup succeeded but login failed.");
      setLoading(false);
      return;
    }

    const user = loginData?.user;

    // ⭐ SEND TO SERVER API FOR COMPANY LINKING
    await fetch("/api/auth/link-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        company_name,
      }),
    });

    // 3️⃣ Redirect
    router.push("/auth/client/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">

      {/* ⭐ HOMEPAGE NAVBAR */}
      <Navbar />

      {/* ⭐ HERO SECTION */}
      <div className="relative w-full h-64 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>

        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Create Your Account
        </h1>
      </div>

      {/* ⭐ SIGNUP CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <form
          onSubmit={handleSignup}
          className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
            Get Started
          </h2>

          <input
            name="company_name"
            type="text"
            placeholder="Company / Hospital Name"
            required
            className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-teal-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-teal-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-teal-500"
          />

          <input
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-teal-500"
          />

          {message && (
            <p className="text-center text-sm text-red-600 dark:text-red-400 mb-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg font-bold rounded-lg shadow-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-gray-300 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/client/login")}
              className="text-teal-600 dark:text-teal-300 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
