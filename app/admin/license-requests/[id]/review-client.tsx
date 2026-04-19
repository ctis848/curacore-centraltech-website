"use client";

import { useEffect, useState } from "react";

export default function ReviewClient({ id }: { id: string }) {
  const [request, setRequest] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, []);

  async function loadRequest() {
    const res = await fetch(`/api/admin/license-requests/${id}`);
    const { data } = await res.json();
    setRequest(data);
    setLoading(false);
  }

  async function approveRequest() {
    const res = await fetch(`/api/admin/license-requests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ manualKey: licenseKey }),
    });

    const result = await res.json();
    alert(result.message);
  }

  async function rejectRequest() {
    const res = await fetch(`/api/admin/license-requests/${id}/reject`, {
      method: "POST",
    });

    const result = await res.json();
    alert(result.message);
  }

  if (loading) return <p>Loading...</p>;
  if (!request) return <p>Request not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Review License Request</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p><strong>Product:</strong> {request.productName}</p>
        <p><strong>Request Key:</strong> {request.requestKey}</p>
        <p><strong>Status:</strong> {request.status}</p>
        <p><strong>User ID:</strong> {request.userId}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Approve Request</h2>

        <textarea
          className="w-full border p-2 rounded mb-3"
          rows={4}
          placeholder="Paste generated license key here..."
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
        />

        <button
          onClick={approveRequest}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3"
        >
          Send License Key
        </button>

        <button
          onClick={rejectRequest}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
