"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Supabase requires a valid session from the reset link
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setMessage("Invalid or expired reset link");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Error updating password");
    } else {
      setMessage("Password updated successfully");
      setTimeout(() => router.replace("/auth/client/login"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleUpdate}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6">
            Set New Password
          </h1>

          <input
            type="password"
            placeholder="New password"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700"
          >
            Update Password
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
