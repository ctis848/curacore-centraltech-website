"use client";

import { useEffect, useState } from "react";

type LicenseStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LicenseRequestRow {
  id: string;                     // REQUIRED — FIXED
  userId: string;
  productName: string | null;
  requestKey: string | null;
  status: LicenseStatus;
  requestedAt: string | null;
  userEmail: string | null;
  companyName: string | null;
  manualKey?: string | null;
}

export default function LicenseRequestsPage() {
  const [requests, setRequests] = useState<LicenseRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LicenseStatus | "ALL">("PENDING");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/license-requests", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to load license requests.");
        setRequests([]);
      } else {
        setRequests(json.data || []);
      }
    } catch (err) {
      console.error("Load license requests error:", err);
      setErrorMsg("Failed to load license requests.");
      setRequests([]);
    }

    setLoading(false);
  }

  async function handleApprove(id: string, manualKey?: string | null) {
    if (!id) {
      alert("Missing request ID.");
      return;
    }

    if (!manualKey || !manualKey.trim()) {
      alert("Please enter a license key before approving.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/license-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualKey: manualKey.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "Failed to approve request.");
        return;
      }

      alert("License approved and email sent.");
      loadRequests();
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve request.");
    }
  }

  async function handleReject(id: string) {
    if (!id) {
      alert("Missing request ID.");
      return;
    }

    const confirmReject = confirm("Are you sure you want to reject this request?");
    if (!confirmReject) return;

    try {
      const res = await fetch(`/api/admin/license-requests/${id}/reject`, {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "Failed to reject request.");
        return;
      }

      alert("Request rejected.");
      loadRequests();
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject request.");
    }
  }

  const filtered = requests.filter((r) =>
    activeTab === "ALL" ? true : r.status === activeTab
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">License Management</h1>

      <div className="flex gap-3 mb-4">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-2 rounded ${
              activeTab === tab ? "bg-emerald-600 text-white" : "bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No requests in this category.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-3">Company</th>
                <th className="p-3">User Email</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Request Key</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t hover:bg-slate-50 transition">
                  <td className="p-3">{req.companyName || "—"}</td>
                  <td className="p-3">{req.userEmail || "—"}</td>
                  <td className="p-3">{req.userId}</td>
                  <td className="p-3">{req.productName || "Unknown"}</td>
                  <td className="p-3">
                    <span className="truncate max-w-[260px] inline-block">
                      {req.requestKey || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
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
                  <td className="p-3">
                    {req.requestedAt
                      ? new Date(req.requestedAt).toLocaleString()
                      : "Invalid Date"}
                  </td>

                  <td className="p-3 flex gap-2 items-center">
                    {req.status === "PENDING" && (
                      <>
                        <input
                          type="text"
                          placeholder="Manual key"
                          className="border px-2 py-1 rounded text-sm w-40"
                          value={req.manualKey || ""}
                          onChange={(e) => {
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === req.id
                                  ? { ...r, manualKey: e.target.value }
                                  : r
                              )
                            );
                          }}
                        />

                        <button
                          onClick={() => handleApprove(req.id, req.manualKey)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === "APPROVED" && (
                      <span className="text-sm text-green-700">Approved</span>
                    )}

                    {req.status === "REJECTED" && (
                      <span className="text-sm text-red-700">Rejected</span>
                    )}
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
