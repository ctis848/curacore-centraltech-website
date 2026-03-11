"use client";

import { useState } from "react";

export default function GenerateLicensePage() {
  const [plan, setPlan] = useState("standard");
  const [machineLimit, setMachineLimit] = useState(1);
  const [licenseKey, setLicenseKey] = useState("");
  const [message, setMessage] = useState("");

  async function generate() {
    const res = await fetch("/api/admin/licenses/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, machine_limit: machineLimit }),
    });

    const data = await res.json();

    if (data.success) {
      setLicenseKey(data.license_key);
      setMessage("License generated successfully.");
    } else {
      setMessage("Error: " + data.error);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Generate License</h1>

      <div className="space-y-2">
        <label>Plan</label>
        <select
          className="border p-2 rounded w-full"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="space-y-2">
        <label>Machine Limit</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={machineLimit}
          onChange={(e) => setMachineLimit(Number(e.target.value))}
        />
      </div>

      <button
        onClick={generate}
        className="px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700 w-full"
      >
        Generate License
      </button>

      {message && <p>{message}</p>}

      {licenseKey && (
        <div className="border p-3 rounded bg-gray-100">
          <strong>License Key:</strong>
          <pre className="font-mono text-sm">{licenseKey}</pre>
        </div>
      )}
    </div>
  );
}
