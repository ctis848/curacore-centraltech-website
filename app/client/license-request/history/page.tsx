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

export default function LicenseRequestHistoryPage() {
  const supabase = supabaseBrowser();

  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("LicenseRequest")
      .select("*")
      .order("requestedAt", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My License Requests</h1>

      {loading && <p className="text-slate-500">Loading your requests…</p>}

      {!loading && requests.length === 0 && (
        <p className="text-slate-500">
          You have not submitted any license requests yet.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Request Key</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Requested At</th>
                <th className="px-4 py-2 text-left">Details</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">{req.productName}</td>

                  <td className="px-4 py-2 font-mono break-all">
                    {req.requestKey}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    {new Date(req.requestedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    <Link
                      href={`/client/license-request/history/${req.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
