"use client";

import { useEffect, useState } from "react";

// 1. Define the shape of a LicenseRequest
interface LicenseRequest {
  id: string;
  productName: string;
  requestKey: string;
  status: string;
  userId: string;
}

// 2. Define params type for Next.js App Router
interface PageProps {
  params: {
    id: string;
  };
}

export default function LicenseRequestReview({ params }: PageProps) {
  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  useEffect(() => {
    loadRequest();
  }, []);

  async function loadRequest() {
    try {
      const res = await fetch(`/api/admin/license-requests/${params.id}`);
      const json = await res.json();

      if (!json.data) {
        setMessage({ type: "error", text: "Request not found" });
      } else {
        setRequest(json.data as LicenseRequest);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load request" });
    }

    setLoading(false);
  }

  async function approveRequest() {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/send-license-key`, {
        method: "POST",
        body: JSON.stringify({
          licenseRequestId: params.id,
          generatedKey: licenseKey,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "License key sent successfully" });
        loadRequest();
      } else {
        setMessage({ type: "error", text: json.error || "Failed to approve request" });
      }
    } catch {
      setMessage({ type: "error", text: "Server error while approving request" });
    }

    setSubmitting(false);
  }

  async function rejectRequest() {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/license-requests/${params.id}/reject`, {
        method: "POST",
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Request rejected" });
        loadRequest();
      } else {
        setMessage({ type: "error", text: json.error || "Failed to reject request" });
      }
    } catch {
      setMessage({ type: "error", text: "Server error while rejecting request" });
    }

    setSubmitting(false);
  }

  if (loading) return <p>Loading request...</p>;
  if (!request) return <p>Request not found.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Review License Request</h1>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

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
          disabled={submitting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3 disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send License Key"}
        </button>

        <button
          onClick={rejectRequest}
          disabled={submitting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
