"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
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
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {}
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Signup successful! Redirecting...");
    setTimeout(() => router.push("/auth/client/login"), 1500);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* CentralCore Navbar */}
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleSignup}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6 text-center">
            Create Account
          </h1>

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          <input
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
          />

          {message && (
            <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Return Home
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/client/login")}
              className="text-teal-600 hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
