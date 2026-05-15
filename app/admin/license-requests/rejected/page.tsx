"use client";

import { useEffect, useState } from "react";

export default function RejectedRequestsPage() {
  const [rejected, setRejected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRejected();
  }, []);

  async function loadRejected() {
    try {
      const res = await fetch(`/api/admin/license-requests?status=REJECTED`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.success) {
        setRejected(json.data || []);
      } else {
        setRejected([]);
      }
    } catch (err) {
      console.error("Failed to load rejected requests:", err);
      setRejected([]);
    }

    setLoading(false);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Rejected Requests</h1>

      {rejected.length === 0 && <p>No rejected requests.</p>}

      <div className="space-y-3">
        {rejected.map((req) => (
          <div key={req.id} className="p-4 bg-white rounded shadow border">
            <p><strong>Company:</strong> {req.companyName || "—"}</p>
            <p><strong>Email:</strong> {req.userEmail || "—"}</p>
            <p><strong>Product:</strong> {req.productName || "Unknown"}</p>
            <p><strong>Request Key:</strong> {req.requestKey || "—"}</p>
            <p><strong>Rejected:</strong> 
              {req.requestedAt
                ? new Date(req.requestedAt).toLocaleString()
                : "Invalid Date"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
