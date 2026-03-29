// FILE: app/admin/settings/UpdateNameForm.tsx
"use client";

import { useState } from "react";

export default function UpdateNameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function updateName(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/settings/update-name", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg("Name updated successfully");
    } else {
      setMsg(data.error || "Failed to update name");
    }
  }

  return (
    <form
      onSubmit={updateName}
      className="bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-lg font-semibold">Update Name</h2>

      {msg && <p className="text-sm text-blue-600">{msg}</p>}

      <input
        type="text"
        className="w-full border p-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Updating..." : "Update Name"}
      </button>
    </form>
  );
}
