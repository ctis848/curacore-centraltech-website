"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (data.error) {
      setMsg(data.error);
    } else {
      setMsg("Password updated successfully.");
      setTimeout(() => router.push("/auth/client-login"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 rounded border mb-4 dark:bg-gray-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {msg && <p className="text-sm text-teal-600 mb-3">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
