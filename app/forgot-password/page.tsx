"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import AuthNavbar from "@/components/AuthNavbar";

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("A password reset link has been sent to your email.");
  }

  return (
    <>
      <AuthNavbar />

      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600 dark:text-green-400">{message}</p>
        )}

        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </>
  );
}
