"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function TransferLicensePage() {
  const supabase = supabaseBrowser();

  const [oldMachineId, setOldMachineId] = useState("");
  const [newDeviceId, setNewDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!oldMachineId.trim() || !newDeviceId.trim()) {
      setError("Both fields are required.");
      return;
    }

    try {
      setLoading(true);

      // Ensure user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      // Call the admin machine transfer API
      const res = await fetch("/api/admin/licenses/transfer", {
        method: "POST",
        body: JSON.stringify({
          old_machine_id: oldMachineId.trim(),
          new_device_id: newDeviceId.trim(),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Unable to transfer license.");
        return;
      }

      setMsg("License transferred successfully. You can now activate the new machine.");
      setOldMachineId("");
      setNewDeviceId("");
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Transfer License
      </h1>

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
            placeholder="Enter the old machine ID..."
          />
        </div>

        {/* New Device ID */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            New Machine Device ID
          </label>
          <textarea
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
            rows={5}
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            placeholder="Paste the new machine's Device ID or Request Key..."
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

        {/* Submit */}
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
