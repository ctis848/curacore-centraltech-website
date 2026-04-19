"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function TransferLicensePage() {
  const supabase = supabaseBrowser();

  const [oldMachineId, setOldMachineId] = useState("");
  const [newRequestKey, setNewRequestKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!oldMachineId.trim() || !newRequestKey.trim()) {
      setError("Both fields are required.");
      return;
    }

    try {
      setLoading(true);

      // ⭐ Get logged‑in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      // ⭐ Validate old machine activation
      const { data: activation, error: actErr } = await supabase
        .from("MachineActivation")
        .select("id, licenseId")
        .eq("machineId", oldMachineId.trim())
        .single();

      if (actErr || !activation) {
        setError("Old machine ID not found or not associated with any license.");
        return;
      }

      // ⭐ Validate license belongs to this user
      const { data: license, error: licErr } = await supabase
        .from("License")
        .select("id, userId")
        .eq("id", activation.licenseId)
        .single();

      if (licErr || !license || license.userId !== user.id) {
        setError("This license does not belong to your account.");
        return;
      }

      // ⭐ Create transfer request
      const { error: insertErr } = await supabase
        .from("LicenseTransferRequest")
        .insert({
          userId: user.id,
          licenseId: license.id,
          oldMachineId: oldMachineId.trim(),
          newRequestKey: newRequestKey.trim(),
          status: "PENDING",
        });

      if (insertErr) {
        console.error(insertErr);
        setError("Unable to submit transfer request.");
        return;
      }

      setMsg("Transfer request submitted successfully. Our team will review it.");
      setOldMachineId("");
      setNewRequestKey("");
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Transfer License</h1>

      <form
        onSubmit={handleTransfer}
        className="bg-white rounded shadow p-4 max-w-xl space-y-3"
      >
        <div>
          <label className="block mb-1 font-semibold">
            Old Machine Identifier
          </label>
          <input
            className="w-full p-2 border rounded"
            value={oldMachineId}
            onChange={(e) => setOldMachineId(e.target.value)}
            placeholder="Old machine ID / fingerprint..."
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">
            New Machine License Request Key
          </label>
          <textarea
            className="w-full p-3 border rounded"
            rows={4}
            value={newRequestKey}
            onChange={(e) => setNewRequestKey(e.target.value)}
            placeholder="Paste the new machine's License Request Key..."
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Transfer Request"}
        </button>
      </form>
    </div>
  );
}
