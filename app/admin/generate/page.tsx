"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";

export default function GenerateLicensePage() {
  const [plan, setPlan] = useState("standard");
  const [machineLimit, setMachineLimit] = useState(1);
  const [licenseKey, setLicenseKey] = useState("");
  const [message, setMessage] = useState("");

  async function generate() {
    setMessage("");
    setLicenseKey("");

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

  function copyKey() {
    navigator.clipboard.writeText(licenseKey);
    alert("License key copied.");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Generate License</h1>

      <div className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="font-medium">Plan</label>
          <select
            className="border p-2 rounded w-full mt-1"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="standard">Standard</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Machine Limit</label>
          <input
            type="number"
            className="border p-2 rounded w-full mt-1"
            value={machineLimit}
            onChange={(e) => setMachineLimit(Number(e.target.value))}
          />
        </div>

        <button
          onClick={generate}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 w-full"
        >
          Generate License
        </button>

        {message && <p className="text-center text-gray-700">{message}</p>}

        {licenseKey && (
          <div className="border p-4 rounded bg-gray-50 space-y-2">
            <p className="font-medium">Generated License Key:</p>
            <pre className="font-mono text-sm break-all">{licenseKey}</pre>

            <button
              onClick={copyKey}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black"
            >
              Copy Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
