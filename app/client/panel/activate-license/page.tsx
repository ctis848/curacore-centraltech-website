"use client";

import { useState } from "react";

export default function ActivateLicensePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [machineId, setMachineId] = useState("");
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Send to correct API route
    const res = await fetch("/api/license-request", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestKey: licenseKey,   // API expects this
        machineId: machineId,     // API now supports this
        productName: productName, // API now supports this
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to send license request");
      return;
    }

    alert("License request sent successfully.");
    setLicenseKey("");
    setMachineId("");
    setProductName("");
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Request License</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">License Key</label>
          <input
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Machine ID</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          {loading ? "Sending..." : "Send License Request"}
        </button>
      </form>
    </div>
  );
}
