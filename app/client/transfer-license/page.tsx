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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const { data: activation, error: actErr } = await supabase
        .from("MachineActivation")
        .select("id, licenseId")
        .eq("machineId", oldMachineId.trim())
        .single();

      if (actErr || !activation) {
        setError("Old machine ID not found or not associated with any license.");
        return;
      }

      const { data: license, error: licErr } = await supabase
        .from("License")
        .select("id, userId")
        .eq("id", activation.licenseId)
        .single();

      if (licErr || !license || license.userId !== user.id) {
        setError("This license does not belong to your account.");
        return;
      }

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
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Transfer License
      </h1>

      {/* Form Container */}
      <form
        onSubmit={handleTransfer}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6"
      >
        {/* Old Machine ID */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Old Machine Identifier
          </label>
          <input
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
            value={oldMachineId}
            onChange={(e) => setOldMachineId(e.target.value)}
            placeholder="Old machine ID / fingerprint..."
          />
        </div>

        {/* New Request Key */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            New Machine License Request Key
          </label>
          <textarea
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
            rows={5}
            value={newRequestKey}
            onChange={(e) => setNewRequestKey(e.target.value)}
            placeholder="Paste the new machine's License Request Key..."
          />
        </div>

        {/* Messages */}
        {error && (
          <p className="text-red-600 font-semibold bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        {msg && (
          <p className="text-green-700 font-semibold bg-green-50 p-3 rounded-lg">
            {msg}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition transform active:scale-95 ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:brightness-110"
          }`}
        >
          {loading ? "Submitting..." : "Submit Transfer Request"}
        </button>
      </form>
    </div>
  );
}
