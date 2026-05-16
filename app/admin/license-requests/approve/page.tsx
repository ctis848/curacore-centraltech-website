"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveLicensePage() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params!.get("id");
  const requestKey = params!.get("key");

  const [licenseKey, setLicenseKey] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function approve() {
    setSending(true);
    setMsg("");

    const res = await fetch(`/api/admin/license-requests/${id}/approve-send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey,
      }),
    });

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setMsg("License sent successfully");

      await fetch(`/api/admin/license-requests/${id}/approve`, {
        method: "POST",
      });

      setTimeout(() => router.push("/admin/license-requests"), 1500);
    } else {
      setMsg(data.error || "Failed to send license");
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Approve License</h1>

      <div className="space-y-4 border p-4 rounded">
        <p><strong>Request Key:</strong></p>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          readOnly
          value={requestKey || ""}
        />

        <p><strong>License Key:</strong></p>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
        />
      </div>

      {msg && (
        <p
          className={`text-sm ${
            msg.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <button
        onClick={approve}
        disabled={sending}
        className="px-4 py-2 bg-emerald-600 text-white rounded w-full"
      >
        {sending ? "Sending..." : "Approve & Send License"}
      </button>
    </div>
  );
}
