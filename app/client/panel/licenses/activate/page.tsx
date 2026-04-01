"use client";

import { useState, useRef } from "react";

export default function ActivateLicensePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [machineId, setMachineId] = useState("");
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const messageRef = useRef<HTMLDivElement | null>(null);

  const scrollToMessage = () => {
    setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic validation
    if (licenseKey.length < 10) {
      setMessage({ type: "error", text: "License key format is invalid." });
      setLoading(false);
      scrollToMessage();
      return;
    }

    if (machineId.length < 8) {
      setMessage({ type: "error", text: "Machine ID / Request Key is too short." });
      setLoading(false);
      scrollToMessage();
      return;
    }

    try {
      const res = await fetch("/api/client/licenses/activate-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          licenseKey,
          machineId,
          productName: productName || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong." });
      } else {
        setMessage({
          type: "success",
          text: "Your activation request has been submitted successfully. Admin will review it shortly.",
        });
        setLicenseKey("");
        setMachineId("");
        setProductName("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }

    setLoading(false);
    scrollToMessage();
  };

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Activate License</h1>

      {message && (
        <div
          ref={messageRef}
          className={`p-3 rounded border ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 bg-white p-5 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">License Key</label>
          <input
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
            placeholder="Enter your license key"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Machine ID / Request Key</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
            placeholder="Paste the machine-generated request key"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Name (Optional)</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            placeholder="Example: CentralCore Pro"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Submitting..." : "Submit Activation Request"}
        </button>
      </form>
    </div>
  );
}
