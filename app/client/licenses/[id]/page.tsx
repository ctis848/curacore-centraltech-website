"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LicenseDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const supabase = supabaseBrowser();
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, []);

  async function loadLicense() {
    setLoading(true);

    // Get logged‑in user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setLicense(null);
      setLoading(false);
      return;
    }

    // Fetch license (NO request key)
    const { data, error } = await supabase
      .from("License")
      .select(`
        id,
        productName,
        licenseKey,
        status,
        activationCount,
        maxActivations,
        expiresAt,
        createdAt,
        updatedAt,
        userId
      `)
      .eq("id", id)
      .eq("userId", user.id) // security: only owner can view
      .single();

    if (!error) setLicense(data);
    setLoading(false);
  }

  async function renewLicense() {
    const res = await fetch("/api/client/renew-license", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    const json = await res.json();
    if (json.success) loadLicense();
  }

  function downloadLicense() {
    const content = `PRODUCT=${license.productName}
LICENSE_KEY=${license.licenseKey}
USER=${license.userId}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${license.productName}-license.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function copyLicenseKey() {
    navigator.clipboard.writeText(license.licenseKey);
    alert("License key copied");
  }

  if (loading) return <p className="text-slate-500">Loading license…</p>;
  if (!license) return <p className="text-slate-500">License not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">License Details</h1>

      <div className="bg-white shadow rounded p-4 space-y-3">
        <p>
          <strong>Product:</strong> {license.productName}
        </p>

        <p className="font-mono break-all">
          <strong>License Key:</strong> {license.licenseKey}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              license.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {license.status}
          </span>
        </p>

        <p>
          <strong>Activation Count:</strong> {license.activationCount}
        </p>

        <p>
          <strong>Max Activations:</strong> {license.maxActivations}
        </p>

        <p>
          <strong>Expires At:</strong>{" "}
          {license.expiresAt ? new Date(license.expiresAt).toLocaleString() : "—"}
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {new Date(license.createdAt).toLocaleString()}
        </p>

        <p>
          <strong>Updated:</strong>{" "}
          {new Date(license.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={copyLicenseKey}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Copy Key
        </button>

        <button
          onClick={downloadLicense}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Download License
        </button>

        <button
          onClick={renewLicense}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Renew License
        </button>

        <a
          href={`/client/licenses/${id}/history`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Activation History
        </a>

        <a
          href={`/client/licenses/${id}/transfer`}
          className="px-4 py-2 bg-orange-600 text-white rounded"
        >
          Transfer License
        </a>
      </div>
    </div>
  );
}
