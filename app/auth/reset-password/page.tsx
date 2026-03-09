'use client';

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const supabase = createSupabaseClient();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully! You can now log in.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 border border-teal-200">
        <h1 className="text-3xl font-black text-teal-800 mb-6 text-center">
          Set New Password
        </h1>

        {message && (
          <p className="text-teal-700 mb-4 text-center animate-fade-up font-semibold">
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <input
            type="password"
            placeholder="New password"
            className="w-full border p-4 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold hover:bg-teal-800 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
