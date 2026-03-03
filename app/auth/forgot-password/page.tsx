"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: any) {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset link sent to your email.");
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>

      {message && <p className="text-teal-600 mb-4">{message}</p>}

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 rounded font-semibold"
        >
          Send Reset Link
        </button>
      </form>

      <p className="mt-4 text-center">
        Back to{" "}
        <a href="/auth/login" className="text-teal-600 font-semibold">
          Login
        </a>
      </p>
    </div>
  );
}
