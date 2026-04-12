"use client";

import { useState, useRef } from "react";

export default function RequestLicensePage() {
  const [requestKey, setRequestKey] = useState("");
  const [productName, setProductName] = useState("");
  const [machineId, setMachineId] = useState("");
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

    if (!productName.trim()) {
      setMessage({ type: "error", text: "Product Name is required." });
      setLoading(false);
      scrollToMessage();
      return;
    }

    if (requestKey.length < 8) {
      setMessage({ type: "error", text: "Request Key is too short." });
      setLoading(false);
      scrollToMessage();
      return;
    }

    try {
      const res = await fetch("/api/license-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          requestKey,
          machineId,
          productName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong." });
      } else {
        setMessage({
          type: "success",
          text: "Your request has been submitted. Admin will generate your license key shortly.",
        });
        setRequestKey("");
        setProductName("");
        setMachineId("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }

    setLoading(false);
    scrollToMessage();
  };

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Request License Key</h1>

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

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            placeholder="Example: CentralCore EMR"
            required
          />
        </div>

        {/* Machine ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Machine ID</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            placeholder="Enter machine ID"
            required
          />
        </div>

        {/* Request Key */}
        <div>
          <label className="block text-sm font-medium mb-1">Request Key</label>
          <input
            value={requestKey}
            onChange={(e) => setRequestKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
            placeholder="Paste the machine-generated request key"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
