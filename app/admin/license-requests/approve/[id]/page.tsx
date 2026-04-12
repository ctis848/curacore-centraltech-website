"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Next.js 16: params is a Promise

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/license-requests/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load request");
        } else {
          setRequest(data.request);
        }
      } catch {
        setError("Network error loading request");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function sendLicense() {
    if (!licenseKey.trim()) {
      setError("License key cannot be empty");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const res = await fetch("/api/license-request/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          licenseKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to approve license");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error approving license");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-600">Loading request...</p>;
  }

  if (error && !success) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
          <h2 className="font-semibold text-lg">Error</h2>
          <p>{error}</p>
        </div>

        <button
          onClick={() => router.push("/admin/license-requests")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Return to Admin Panel
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-green-100 text-green-800 p-4 rounded-lg border border-green-300">
          <h2 className="text-xl font-semibold">License Approved</h2>
          <p>The license has been stored and will be visible in the client portal.</p>
        </div>

        <button
          onClick={() => router.push("/admin/license-requests")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Approve License Request</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-3 border">
        <h2 className="text-xl font-semibold">Request Information</h2>

        <p><strong>User:</strong> {request.user_email}</p>
        <p><strong>Product:</strong> {request.product_name}</p>
        <p><strong>Machine ID:</strong> {request.machine_id || "N/A"}</p>
        <p><strong>Request Key:</strong> {request.request_key}</p>
        <p><strong>Status:</strong> {request.status}</p>
        <p><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-3 border">
        <h2 className="text-xl font-semibold">Paste License Key</h2>

        <textarea
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste the generated license key here..."
          className="w-full border rounded p-3 h-32 focus:ring focus:ring-blue-300"
        />
      </div>

      <button
        onClick={sendLicense}
        disabled={!licenseKey.trim() || sending}
        className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg disabled:opacity-50 hover:bg-green-500"
      >
        {sending ? "Saving..." : "Save & Approve License"}
      </button>
    </div>
  );
}
