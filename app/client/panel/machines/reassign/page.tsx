"use client";

import { useEffect, useState } from "react";

export default function ClientMachineReassignmentPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/client/machines", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setMachines(d.machines || []));
  }, []);

  async function reassign() {
    if (!selectedMachine || !licenseKey) {
      return alert("Select a machine and enter a license key");
    }

    setLoading(true);

    // Revoke old machine
    await fetch("/api/client/machines/revoke", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId: selectedMachine }),
    });

    // Activate on new machine
    const res = await fetch("/api/client/activate-license", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey,
        machineId: crypto.randomUUID(),
        machineName: "New Device",
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error);

    alert("License reassigned successfully");
    window.location.href = "/client/client-panel/machines";
  }

  return (
    <div className="space-y-10 max-w-xl">
      <h1 className="text-3xl font-bold">Reassign License</h1>

      <div className="p-6 bg-white border rounded-lg shadow space-y-4">
        <label className="block text-sm font-medium">Select Machine to Remove</label>

        <select
          className="input"
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
        >
          <option value="">Select machine...</option>
          {machines.map((m) => (
            <option key={m.machineId} value={m.machineId}>
              {m.machineName} — {m.machineId}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium">License Key</label>
        <input
          className="input"
          placeholder="Enter license key"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
        />

        <button
          onClick={reassign}
          disabled={loading}
          className="px-4 py-2 bg-teal-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Reassigning..." : "Reassign License"}
        </button>
      </div>
    </div>
  );
}
