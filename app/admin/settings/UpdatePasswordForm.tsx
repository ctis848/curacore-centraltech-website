// FILE: app/admin/settings/UpdatePasswordForm.tsx
"use client";

import { useState } from "react";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/settings/update-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg("Password updated successfully");
      setPassword("");
    } else {
      setMsg(data.error || "Failed to update password");
    }
  }

  return (
    <form
      onSubmit={updatePassword}
      className="bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-lg font-semibold">Update Password</h2>

      {msg && <p className="text-sm text-blue-600">{msg}</p>}

      <input
        type="password"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
