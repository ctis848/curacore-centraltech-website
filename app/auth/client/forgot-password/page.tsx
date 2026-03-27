"use client";

import { useState } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/client/reset-password`,
    });

    if (error) {
      setMessage("Error sending reset link");
    } else {
      setMessage("Password reset link sent to your email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleReset}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6">
            Reset Password
          </h1>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700"
          >
            Send Reset Link
          </button>

          {message && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
