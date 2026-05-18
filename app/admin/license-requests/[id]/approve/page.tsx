"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApproveLicensePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [request, setRequest] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadRequest() {
      const res = await fetch(`/api/admin/license-requests/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Failed to load request" });
        setLoading(false);
        return;
      }

      setRequest(data);
      setLoading(false);
    }

    loadRequest();
  }, [id]);

  async function handleApprove() {
    if (!id) return;

    setMsg(null);

    if (!licenseKey.trim()) {
      setMsg({ type: "error", text: "License key is required." });
      return;
    }

    const res = await fetch(`/api/admin/license-requests/${id}/approve-send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg({ type: "error", text: data.error || "Failed to approve request." });
      return;
    }

    setMsg({ type: "success", text: "License approved and sent successfully." });

    setTimeout(() => {
      router.push("/admin/license-requests");
    }, 1500);
  }

  if (!id) return <p className="text-red-600">Invalid request ID.</p>;
  if (loading) return <p>Loading...</p>;
  if (!request) return <p className="text-red-600">Request not found.</p>;

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Approve License</h1>

      <div className="mb-4">
        <label className="font-semibold">Request Key</label>
        <textarea
          className="w-full p-2 border rounded bg-gray-100"
          rows={3}
          readOnly
          value={request.requestKey}
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">License Key</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste the manual license key here..."
        />
      </div>

      {msg && (
        <p className={`mb-3 text-sm ${msg.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {msg.text}
        </p>
      )}

      <button
        onClick={handleApprove}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        Approve & Send License
      </button>
    </div>
  );
}
