"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import AuthNavbar from "@/components/AuthNavbar";

export default function SignupPage() {
  const supabase = createSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  }

  return (
    <>
      <AuthNavbar />

      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {message && <p className="mt-4 text-green-600">{message}</p>}

        <div className="mt-6 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">
            Already have an account? Login
          </a>
        </div>
      </div>
    </>
  );
}
