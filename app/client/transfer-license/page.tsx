"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function TransferLicensePage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<any[]>([]);
  const [selectedLicenseId, setSelectedLicenseId] = useState("");

  const [productName, setProductName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [oldLicenseKey, setOldLicenseKey] = useState("");
  const [newRequestKey, setNewRequestKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // ⭐ Load all approved licenses for this user
  useEffect(() => {
    async function loadLicenses() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          setAutoLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("LicenseRequest")
          .select("*")
          .eq("userEmail", user.email)
          .eq("status", "APPROVED")
          .order("processedAt", { ascending: false });

        if (!error && data) {
          setLicenses(data);

          // Auto-select the most recent license
          if (data.length > 0) {
            const latest = data[0];
            setSelectedLicenseId(latest.id);
            setProductName(latest.productName ?? "");
            setCompanyName(latest.companyName ?? "");
            setOldLicenseKey(latest.licenseKey ?? "");
          }
        }
      } catch (err) {
        console.error("Auto-load error:", err);
      }

      setAutoLoading(false);
    }

    loadLicenses();
  }, []);

  // ⭐ When user selects a different license from dropdown
  useEffect(() => {
    if (!selectedLicenseId) return;

    const selected = licenses.find((l) => l.id === selectedLicenseId);
    if (selected) {
      setProductName(selected.productName ?? "");
      setCompanyName(selected.companyName ?? "");
      setOldLicenseKey(selected.licenseKey ?? "");
    }
  }, [selectedLicenseId, licenses]);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!oldLicenseKey.trim() || !newRequestKey.trim()) {
      setError("Old License Key and New Request-Key are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/client/transfer-license", {
        method: "POST",
        body: JSON.stringify({
          oldLicenseKey: oldLicenseKey.trim(),
          newRequestKey: newRequestKey.trim(),
          productName,
          companyName,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Unable to submit transfer request.");
        return;
      }

      setMsg("Transfer request submitted successfully.");
      setNewRequestKey("");
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Transfer License
      </h1>

      <form
        onSubmit={handleTransfer}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8"
      >
        {/* License Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Select License to Transfer
          </label>

          <select
            className="w-full px-4 py-3 border rounded-lg shadow-sm bg-white"
            value={selectedLicenseId}
            onChange={(e) => setSelectedLicenseId(e.target.value)}
          >
            {licenses.length === 0 && (
              <option>No approved licenses found</option>
            )}

            {licenses.map((l) => (
              <option key={l.id} value={l.id}>
                {l.productName} — {l.licenseKey}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Product Name
          </label>
          <input
            className="w-full px-4 py-3 border rounded-lg shadow-sm bg-slate-100"
            value={productName}
            readOnly
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Company Name
          </label>
          <input
            className="w-full px-4 py-3 border rounded-lg shadow-sm bg-slate-100"
            value={companyName}
            readOnly
          />
        </div>

        {/* Old License Key */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Old License Key
          </label>
          <input
            className="w-full px-4 py-3 border rounded-lg shadow-sm font-mono bg-slate-100"
            value={oldLicenseKey}
            readOnly
          />
        </div>

        {/* New Request Key */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            New Request-Key (from new computer)
          </label>
          <textarea
            className="w-full px-4 py-3 border rounded-lg shadow-sm font-mono"
            rows={5}
            value={newRequestKey}
            onChange={(e) => setNewRequestKey(e.target.value)}
            placeholder="Paste the new machine's Request-Key..."
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
          className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl"
          }`}
        >
          {loading ? "Submitting..." : "Submit Transfer Request"}
        </button>
      </form>

      {/* Instruction Block */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-slate-200 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-bold text-slate-700">Important Notes</h2>

        <ul className="list-disc ml-6 text-slate-600 space-y-2">
          <li>Select the correct license you want to transfer.</li>
          <li>The Old License Key is automatically loaded based on your selection.</li>
          <li>Generate a New Request-Key from the new computer.</li>
          <li>Your request will be reviewed manually by an administrator.</li>
          <li>You will receive a new license key via email once approved.</li>
        </ul>
      </div>
    </div>
  );
}
