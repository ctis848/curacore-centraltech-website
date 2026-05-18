"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type MsgType = { type: "error" | "success"; text: string } | null;

export default function SendLicensePage() {
  // Declare searchParams ONCE — and force non-null
  const searchParams = useSearchParams()!;

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<MsgType>(null);

  // Auto-fill from URL
  useEffect(() => {
    const emailParam = searchParams.get("email") ?? "";
    const companyParam = searchParams.get("company") ?? "";

    setEmail(emailParam);
    setCompanyName(companyParam);
  }, [searchParams]);

  async function handleSend() {
    setMsg(null);
    setLoading(true);

    const payload = {
      email,
      companyName,
      licenseKey,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/admin/send-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg({ type: "error", text: data.error || "Failed to save license" });
      return;
    }

    setMsg({ type: "success", text: "License saved successfully" });
    setLicenseKey("");
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Send License Manually</h1>

      <div className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Client Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Paste License Key"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
        />

        {msg && (
          <p
            className={`text-sm ${
              msg.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded w-full"
        >
          {loading ? "Saving..." : "Save License"}
        </button>
      </div>
    </div>
  );
}
