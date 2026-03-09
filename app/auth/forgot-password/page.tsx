'use client';

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMessage("Password reset link sent to your email.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-lg border border-teal-200 w-full max-w-sm"
      >
        <h1 className="text-3xl font-black text-teal-800 mb-6 text-center">
          Reset Password
        </h1>

        {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
        {errorMsg && <p className="text-red-600 mb-4 text-center">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-4 border rounded-xl mb-6"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold hover:bg-teal-800 transition"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
