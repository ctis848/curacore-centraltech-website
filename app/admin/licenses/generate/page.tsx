"use client";

import { useState } from "react";

export default function GenerateLicensePage() {
  const [userId, setUserId] = useState("");
  const [productName, setProductName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    const res = await fetch("/api/admin/licenses/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productName, licenseKey }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setSuccess(true);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Generate License</h1>

      {success && (
        <p className="text-green-700 font-semibold">License Created Successfully</p>
      )}

      {error && <p className="text-red-600">{error}</p>}

      <input
        className="border p-2 rounded w-full"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <textarea
        className="border p-2 rounded w-full h-32"
        placeholder="License Key"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
      />

      <button
        onClick={generate}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Create License
      </button>
    </div>
  );
}
