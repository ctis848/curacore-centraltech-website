"use client";

import { useState } from "react";

export default function RenewLicenseButton({ licenseId }: { licenseId: string }) {
  const [loading, setLoading] = useState(false);

  const renew = async () => {
    setLoading(true);

    const res = await fetch("/api/licenses/renew", {
      method: "POST",
      body: JSON.stringify({ licenseId }),
    });

    setLoading(false);

    if (res.ok) {
      alert("License renewed successfully");
      location.reload();
    } else {
      alert("Failed to renew license");
    }
  };

  return (
    <button
      onClick={renew}
      disabled={loading}
      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
    >
      {loading ? "Renewing..." : "Renew License"}
    </button>
  );
}
