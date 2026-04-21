"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  // ⭐ FIX: Safe access
  const token = params?.get("token") ?? null;

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setMsg("Invalid or missing reset token");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setMsg(data.error || "Failed to reset password");
      return;
    }

    setMsg("Password reset successful");
    router.push("/auth/client/login");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

      {msg && <p className="mb-3 text-red-600">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
