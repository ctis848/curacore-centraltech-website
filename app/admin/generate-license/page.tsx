"use client";

import { useState } from "react";

export default function GenerateLicensePage() {
  const [clientEmail, setClientEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit() {
    setStatus("Saving...");

    const res = await fetch("/api/save-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientEmail, licenseKey }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("License saved and email sent.");
      setClientEmail("");
      setLicenseKey("");
    } else {
      setStatus(data.error || "Something went wrong.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate License</h1>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block mb-1 font-medium">Client Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">License Key</label>
          <textarea
            className="w-full p-2 border rounded h-32 font-mono"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Paste generated license key here..."
          />
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-teal-600 text-white rounded"
        >
          Save & Send
        </button>

        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
