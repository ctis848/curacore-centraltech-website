"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import AuthNavbar from "@/components/AuthNavbar";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Supabase requires a valid session from the reset link
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Invalid or expired reset link.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Your password has been updated successfully.");
  }

  return (
    <>
      <AuthNavbar />

      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Confirm new password"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Updating..." : "Update Password"}
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
