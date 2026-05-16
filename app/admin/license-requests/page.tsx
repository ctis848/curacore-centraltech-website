"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LicenseRequest = {
  id: string;
  userEmail: string | null;
  companyname: string | null;
  productName: string;
  requestKey: string;
  status: string;
  requestedAt?: string;
};

export default function LicenseRequestListPage() {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch("/api/admin/license-requests", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to load requests:", err);
      }

      setLoading(false);
    }

    loadRequests();
  }, []);

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/admin/license-requests/${id}/reject`, {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Failed to reject request");
        return;
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
      );
    } catch (err) {
      console.error("Reject error:", err);
    }
  }

  if (loading) {
    return <div className="p-6">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="p-6 text-gray-600">No license requests found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">License Requests</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Company</th>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Request Key</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b">
              <td className="p-2">{req.userEmail || "—"}</td>
              <td className="p-2">{req.companyname || "—"}</td>
              <td className="p-2">{req.productName}</td>
              <td className="p-2 font-mono text-xs break-all">{req.requestKey}</td>
              <td className="p-2">{req.status}</td>
              <td className="p-2">
                <div className="flex gap-3">
                  <Link
                    href={`/admin/license-requests/approve?id=${req.id}&key=${req.requestKey}`}
                    className="text-emerald-600 underline"
                  >
                    Approve
                  </Link>

                  <button
                    onClick={() => handleReject(req.id)}
                    className="text-red-600 underline disabled:opacity-50"
                    disabled={req.status === "REJECTED"}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
