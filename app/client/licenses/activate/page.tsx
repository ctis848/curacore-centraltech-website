"use client";

import { useState } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function ActivateLicensePage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/client/licenses/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Activation failed");
    } else {
      setMessage("License activated successfully.");
      setKey("");
    }

    setLoading(false);
  }

  return (
    <DashboardClient>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4">Activate License</h1>
        <p className="text-slate-500 mb-4">
          Enter your license key to bind it to your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">License Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Activating..." : "Activate"}
          </button>

          {message && <p className="text-sm text-emerald-600 mt-2">{message}</p>}
          {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        </form>
      </div>
    </DashboardClient>
  );
}
