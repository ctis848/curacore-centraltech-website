"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

interface LicenseRequest {
  id: string;
  userId: string;
  productName: string;
  requestKey: string;
  status: string;
  requestedAt: string;
  notes: string | null;
  processedat?: string | null;
  processedby?: string | null;
}

interface License {
  id: string;
  licenseKey: string;
  productName: string;
  status: string;
  created_at: string;
}

export default function LicenseRequestDetailsPage({ params }: any) {
  const supabase = supabaseBrowser();

  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDetails() {
    setLoading(true);

    // 1. Load the request
    const { data: reqData } = await supabase
      .from("LicenseRequest")
      .select("*")
      .eq("id", params.id)
      .single();

    if (reqData) {
      setRequest(reqData);
    }

    // 2. If approved, load the license generated from this request
    if (reqData?.status === "APPROVED") {
      const { data: licData } = await supabase
        .from("License")
        .select("*")
        .eq("licenseRequestId", params.id)
        .single();

      if (licData) {
        setLicense(licData);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDetails();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading request details…</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-red-600">Request not found.</p>
        <Link href="/client/license-request/history" className="text-blue-600 underline">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">License Request Details</h1>

      <div className="bg-white shadow rounded-lg p-6 border">
        {/* Product */}
        <div className="mb-4">
          <h2 className="font-semibold text-slate-700">Product</h2>
          <p className="text-slate-900">{request.productName}</p>
        </div>

        {/* Request Key */}
        <div className="mb-4">
          <h2 className="font-semibold text-slate-700">License Request Key</h2>
          <p className="font-mono text-slate-900 break-all">{request.requestKey}</p>
        </div>

        {/* Notes */}
        {request.notes && (
          <div className="mb-4">
            <h2 className="font-semibold text-slate-700">Notes</h2>
            <p className="text-slate-900 whitespace-pre-line">{request.notes}</p>
          </div>
        )}

        {/* Status */}
        <div className="mb-4">
          <h2 className="font-semibold text-slate-700">Status</h2>
          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${
              request.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : request.status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {request.status}
          </span>
        </div>

        {/* Requested At */}
        <div className="mb-4">
          <h2 className="font-semibold text-slate-700">Requested At</h2>
          <p className="text-slate-900">
            {new Date(request.requestedAt).toLocaleString()}
          </p>
        </div>

        {/* Processed Info */}
        {request.processedat && (
          <div className="mb-4">
            <h2 className="font-semibold text-slate-700">Processed</h2>
            <p className="text-slate-900">
              {request.processedby} at{" "}
              {new Date(request.processedat).toLocaleString()}
            </p>
          </div>
        )}

        {/* License Info (if approved) */}
        {license && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold text-green-800 mb-2">Generated License</h2>

            <p className="text-sm text-green-900">
              <span className="font-medium">License Key:</span>{" "}
              <span className="font-mono break-all">{license.licenseKey}</span>
            </p>

            <p className="text-sm text-green-900 mt-2">
              <span className="font-medium">Created At:</span>{" "}
              {new Date(license.created_at).toLocaleString()}
            </p>

            <Link
              href={`/client/licenses/${license.id}`}
              className="text-blue-600 underline mt-3 inline-block"
            >
              View License
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/client/license-request/history"
          className="text-blue-600 hover:underline"
        >
          ← Back to Request History
        </Link>
      </div>
    </div>
  );
}
