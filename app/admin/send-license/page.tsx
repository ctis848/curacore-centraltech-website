"use client";

import { useState } from "react";

export default function SendLicensePage() {
  const [email, setEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [requestKey, setRequestKey] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [mode, setMode] = useState("manual"); // manual | brevo
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSend() {
    setMsg("");
    setLoading(true);

    let endpoint = "/api/admin/send-license";
    let payload: any = { email, productName };

    if (mode === "manual") {
      payload.requestKey = requestKey;
    }

    if (mode === "brevo") {
      endpoint = "/api/admin/brevo/send-license";
      payload.licenseKey = licenseKey;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg("License sent successfully");
      setEmail("");
      setProductName("");
      setRequestKey("");
      setLicenseKey("");
    } else {
      setMsg(data.error || "Failed to send license");
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Send License Manually</h1>

      <div className="space-y-4">
        {/* Email */}
        <input
          className="w-full p-2 border rounded"
          placeholder="Client Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Product */}
        <select
          className="w-full p-2 border rounded"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        >
          <option value="">Select Product</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>

        {/* Request Key (Manual Mode) */}
        {mode === "manual" && (
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Request Key"
            value={requestKey}
            onChange={(e) => setRequestKey(e.target.value)}
          />
        )}

        {/* License Key (Brevo Mode) */}
        {mode === "brevo" && (
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
          />
        )}

        {/* Sending Mode */}
        <select
          className="w-full p-2 border rounded"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="manual">Send via Resend (Default)</option>
          <option value="brevo">Send via Brevo</option>
        </select>

        {/* Message */}
        {msg && (
          <p
            className={`text-sm ${
              msg.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded w-full"
        >
          {loading ? "Sending..." : "Send License"}
        </button>
      </div>
    </div>
  );
}
