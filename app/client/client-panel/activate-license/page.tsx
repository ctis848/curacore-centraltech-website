"use client";

import { useState } from "react";

export default function ActivateLicensePage() {
  const [requestKey, setRequestKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/license/request-activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_key: requestKey }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessage("Your request has been sent. You will receive your license by email.");
      setRequestKey("");
    } else {
      setError(data.error || "Unable to send request.");
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Activate License</h1>

      <p className="text-gray-600">
        Paste your <strong>License Request Key</strong> below.  
        We will email your license file after manual verification.
      </p>

      <textarea
        value={requestKey}
        onChange={(e) => setRequestKey(e.target.value)}
        placeholder="Paste License Request Key here..."
        className="w-full h-40 p-3 border rounded-lg focus:ring focus:ring-teal-300"
      />

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !requestKey.trim()}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 w-full disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Activation Request"}
      </button>
    </div>
  );
}
