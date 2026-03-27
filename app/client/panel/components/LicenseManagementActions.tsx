"use client";

import { useState } from "react";

function LicenseManagementActions({ licenseKey }: { licenseKey: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [transferEmail, setTransferEmail] = useState("");

  const handleAction = async (endpoint: string, body: any = {}) => {
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/client/licenses/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ licenseKey, ...body }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
      return;
    }

    setMessage({ type: "success", text: data.message });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        License Management
      </h3>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">

        <button
          onClick={() => handleAction("deactivate")}
          disabled={loading}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          {loading ? "Processing..." : "Deactivate License"}
        </button>

        <div className="space-y-3">
          <label className="text-gray-700 dark:text-gray-300">Transfer License</label>

          <input
            type="email"
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
            placeholder="Recipient email"
          />

          <button
            onClick={() => handleAction("transfer", { email: transferEmail })}
            disabled={loading || !transferEmail}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? "Processing..." : "Transfer License"}
          </button>
        </div>

        <button
          onClick={() => handleAction("refresh")}
          disabled={loading}
          className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
        >
          {loading ? "Refreshing..." : "Refresh License Status"}
        </button>

      </div>
    </div>
  );
}

export default LicenseManagementActions;
