"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RejectLicensePage(
  { params }: { params: { id: string } }
) {
  const router = useRouter();
  const { id } = params; // Correct for Client Components

  const [request, setRequest] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/license-requests/${id}`);
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setRequest(data.request);
      setLoading(false);
    }
    load();
  }, [id]);

  async function rejectRequest() {
    if (!reason.trim()) {
      setError("Rejection reason cannot be empty");
      return;
    }

    const res = await fetch("/api/license-request/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, reason }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setSuccess(true);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  if (error && !success)
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-100 text-red-700 p-4 rounded border border-red-300">
          <h2 className="font-semibold text-lg">Error</h2>
          <p>{error}</p>
        </div>

        <button
          onClick={() => router.push("/admin/license-requests")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back
        </button>
      </div>
    );

  if (success)
    return (
      <div className="p-6 space-y-4">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded border border-yellow-300">
          <h2 className="text-xl font-semibold">Request Rejected</h2>
          <p>The user will be notified.</p>
        </div>

        <button
          onClick={() => router.push("/admin/license-requests")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Requests
        </button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Reject License Request</h1>

      <div className="bg-white shadow rounded p-6 space-y-3 border">
        <p><strong>User:</strong> {request.user_email}</p>
        <p><strong>Product:</strong> {request.product_name}</p>
        <p><strong>Request Key:</strong> {request.request_key}</p>
      </div>

      <textarea
        className="w-full border p-3 rounded h-32"
        placeholder="Enter rejection reason..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button
        onClick={rejectRequest}
        disabled={!reason.trim()}
        className="px-6 py-3 bg-red-600 text-white rounded disabled:opacity-50"
      >
        Reject Request
      </button>
    </div>
  );
}
