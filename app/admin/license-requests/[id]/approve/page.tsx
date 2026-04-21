"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type PageProps = {
  params: Promise<{ id?: string | null }>;
};

export default function ApproveLicenseRequestPage({ params }: PageProps) {
  // ⭐ Unwrap async params (Next.js 16 requirement)
  const resolved = use(params);

  if (!resolved?.id) {
    notFound();
  }

  const requestId = resolved.id;

  const supabase = supabaseBrowser();

  const [licenseKey, setLicenseKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    loadRequest();
  }, []);

  async function loadRequest() {
    const { data, error } = await supabase
      .from("LicenseRequest")
      .select("id, userId, productName, requestKey, status, userEmail")
      .eq("id", requestId)
      .single();

    if (error) {
      console.error("Load LicenseRequest error:", error);
      setErrorMsg("Failed to load request.");
      return;
    }

    setRequest(data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!licenseKey.trim()) {
      setErrorMsg("Please paste a valid license key.");
      return;
    }

    if (!request) {
      setErrorMsg("Request not loaded.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/admin/send-license-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseRequestId: requestId,
        generatedKey: licenseKey.trim(),
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      setErrorMsg(json.error || "Failed to send license key.");
      setSaving(false);
      return;
    }

    setSuccessMsg("License successfully sent to Client Portal.");

    setTimeout(() => {
      window.location.href = "/admin/license-requests";
    }, 1200);

    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Send License Key</h1>

      {request && (
        <div className="mb-4 p-4 bg-slate-100 rounded border space-y-1">
          <p><strong>Product:</strong> {request.productName || "Unknown Product"}</p>
          <p><strong>Request Key:</strong> {request.requestKey}</p>
          <p><strong>Status:</strong> {request.status}</p>
          <p><strong>User Email:</strong> {request.userEmail || "—"}</p>
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white shadow rounded p-4">
        <label className="block mb-2 font-semibold">
          Paste License Key (generated manually)
        </label>

        <textarea
          className="w-full p-3 border rounded mb-3"
          rows={8}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste the generated license key here..."
        />

        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Sending..." : "Send License Key to Client Portal"}
        </button>
      </form>
    </div>
  );
}
