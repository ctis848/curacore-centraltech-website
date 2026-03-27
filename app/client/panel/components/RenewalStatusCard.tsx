"use client";

import { useEffect, useState } from "react";
import { License } from "@/app/types/license";

export default function RenewalStatusCard({ license }: { license: License }) {
  const [loading, setLoading] = useState(false);

  // Revoke license (free machine)
  async function handleRevoke() {
    if (!confirm("Are you sure you want to revoke this license? This will free it for use on another machine.")) {
      return;
    }

    setLoading(true);

    const res = await fetch("/api/license/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_id: license.id }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("License revoked. You can now activate it on a new machine.");
      window.location.reload();
    } else {
      alert("Error: " + data.error);
    }
  }

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">License Status</h2>

      {/* STATUS BOX */}
      <div
        className={`p-3 rounded-lg border ${
          license.is_active
            ? "bg-green-100 text-green-700 border-green-300"
            : "bg-red-100 text-red-700 border-red-300"
        }`}
      >
        <strong>Status:</strong>{" "}
        {license.is_active ? "Active" : "Inactive"}
      </div>

      {/* DETAILS */}
      <div className="text-gray-700 space-y-1">
        <p>
          <strong>Last Activation:</strong>{" "}
          {license.last_payment_date
            ? new Date(license.last_payment_date).toLocaleDateString()
            : "Not available"}
        </p>

        <p>
          <strong>Renewal Due Date:</strong>{" "}
          {license.renewal_due_date
            ? new Date(license.renewal_due_date).toLocaleDateString()
            : "Not set"}
        </p>

        <p>
          <strong>Service Fee Paid:</strong>{" "}
          {license.service_fee_paid ? "Yes" : "No"}
        </p>

        <p>
          <strong>Auto‑Revoked:</strong>{" "}
          {license.auto_revoked ? "Yes" : "No"}
        </p>
      </div>

      {/* REVOKE BUTTON */}
      {license.is_active && (
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full disabled:opacity-50"
        >
          {loading ? "Revoking..." : "Revoke License (Free Machine)"}
        </button>
      )}
    </div>
  );
}
