"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function TransferLicensePage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email.trim()) {
      setMsg("Enter recipient email.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/client/transfer-license", {
      method: "POST",
      body: JSON.stringify({ licenseId: id, newEmail: email }),
    });

    const json = await res.json();

    if (!json.success) {
      setMsg(json.error);
      setSaving(false);
      return;
    }

    setMsg("Transfer request sent to admin.");
    setSaving(false);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Transfer License</h1>

      <form onSubmit={handleTransfer} className="bg-white shadow p-4 rounded">
        <label className="block mb-2 font-semibold">Recipient Email</label>
        <input
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter new owner's email"
        />

        {msg && <p className="mb-2">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "Sending..." : "Send Transfer Request"}
        </button>
      </form>
    </div>
  );
}
