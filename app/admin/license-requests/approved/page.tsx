"use client";

import { useEffect, useState } from "react";

export default function ApprovedRequestsPage() {
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApproved();
  }, []);

  async function loadApproved() {
    const res = await fetch("/api/admin/license-requests/approved");
    const json = await res.json();

    if (json.success) setApproved(json.data);
    setLoading(false);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Approved Licenses</h1>

      {approved.length === 0 && <p>No approved licenses yet.</p>}

      <div className="space-y-3">
        {approved.map((req) => (
          <div key={req.id} className="p-4 bg-white rounded shadow border">
            <p><strong>Company:</strong> {req.User?.companyName}</p>
            <p><strong>Email:</strong> {req.User?.email}</p>
            <p><strong>Product:</strong> {req.productName}</p>
            <p><strong>License Key:</strong> {req.ApprovedLicense?.License?.licenseKey}</p>
            <p><strong>Approved:</strong> {new Date(req.ApprovedLicense?.approvedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
