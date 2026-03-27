"use client";

import { useState } from "react";

export default function ActivateLicensePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [machineId, setMachineId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`License ${licenseKey} activated for machine ${machineId} (demo).`);
    setLicenseKey("");
    setMachineId("");
  };

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Activate License</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">License Key</label>
          <input
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Machine ID</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Activate
        </button>
      </form>
    </div>
  );
}
