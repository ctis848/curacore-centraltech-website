"use client";

import { useEffect, useState } from "react";

export default function RejectedRequestsPage() {
  const [rejected, setRejected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRejected();
  }, []);

  async function loadRejected() {
    const res = await fetch("/api/admin/license-requests");
    const json = await res.json();

    if (json.success) {
      setRejected(json.data.filter((r: any) => r.status === "REJECTED"));
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
            <p><strong>Company:</strong> {req.User?.companyName}</p>
            <p><strong>Email:</strong> {req.User?.email}</p>
            <p><strong>Product:</strong> {req.productName}</p>
            <p><strong>Request Key:</strong> {req.requestKey}</p>
            <p><strong>Rejected:</strong> {new Date(req.requestedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
