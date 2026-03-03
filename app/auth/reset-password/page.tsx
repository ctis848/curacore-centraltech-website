"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const supabase = createSupabaseClient();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Supabase handles the session from the link automatically
  }, [searchParams, supabase]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. You can now log in.");
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Set new password</h1>

      {message && <p className="mb-4 text-teal-700">{message}</p>}

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 rounded font-semibold"
        >
          Update password
        </button>
      </form>
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
