"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LicenseRequestApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // Unwrap params (Next.js 15+)
  const { id: requestId } = use(params);

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  // Load request details
  useEffect(() => {
    async function loadRequest() {
      const res = await fetch(`/api/admin/license-requests/${requestId}`);
      const data = await res.json();

      if (res.ok) {
        setRequest(data);
      } else {
        setMsg(data.error || "Failed to load request");
      }

      setLoading(false);
    }

    loadRequest();
  }, [requestId]);

<<<<<<< HEAD
  // ⭐ THIS FUNCTION MUST BE INSIDE THE COMPONENT
=======
>>>>>>> f30524c (Fix license approval pages and API routes)
  async function approveRequest() {
    if (!request) return;

    setSending(true);
    setMsg("");

<<<<<<< HEAD
=======
    // FIXED — use userEmail
>>>>>>> f30524c (Fix license approval pages and API routes)
    const payload = {
      email: request.userEmail,
      productName: request.productName,
      requestKey: request.requestKey,
    };

<<<<<<< HEAD
    // ⭐ FIXED — correct backend route
    const res = await fetch(
      `/api/admin/license-requests/${requestId}/approve-send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
=======
    const res = await fetch("/api/admin/send-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
>>>>>>> f30524c (Fix license approval pages and API routes)

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setMsg("License approved and sent successfully");

      await fetch(`/api/admin/license-requests/${requestId}/approve`, {
        method: "POST",
      });

      setTimeout(() => router.push("/admin/license-requests"), 1500);
    } else {
      setMsg(data.error || "Failed to approve request");
    }
  }

  if (loading) {
    return <div className="p-6">Loading request...</div>;
  }

  if (!request) {
    return <div className="p-6 text-red-600">Request not found</div>;
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Approve License Request</h1>

      <div className="space-y-4 border p-4 rounded">
        <p><strong>Email:</strong> {request.userEmail}</p>
        <p><strong>Product:</strong> {request.productName}</p>

        <div>
          <p><strong>Request Key:</strong></p>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            readOnly
            value={request.requestKey}
          />
        </div>

        <div>
          <p><strong>Notes:</strong></p>
          <textarea
            className="w-full p-2 border rounded bg-gray-50"
            rows={3}
            readOnly
            value={request.notes || "No notes provided"}
          />
        </div>
      </div>

      {msg && (
        <p
          className={`text-sm ${
            msg.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <button
        onClick={approveRequest}
        disabled={sending}
        className="px-4 py-2 bg-emerald-600 text-white rounded w-full"
      >
        {sending ? "Approving..." : "Approve & Send License"}
      </button>
    </div>
  );
}
