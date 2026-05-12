"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRequest {
  id: string;
  userId: string;
  productName: string;
  status: string;
  requestedAt: string;
  notes: string | null;
  processedat?: string | null;
  processedby?: string | null;
}

export default function AdminLicenseManagementPage() {
  const supabase = supabaseBrowser();

  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  const [manualKey, setManualKey] = useState("");

  // Load license requests
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

  // Approve request
  async function approveRequest(id: string) {
    const res = await fetch(`/api/admin/licenserequests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ manualKey }),
    });

    if (res.ok) {
      alert("License approved and key sent to client.");
      loadRequests();
    } else {
      alert("Failed to approve request.");
    }
  }

  // Reject request
  async function rejectRequest(id: string) {
    const res = await fetch(`/api/admin/licenserequests/${id}/reject`, {
      method: "POST",
    });

    if (res.ok) {
      alert("Request rejected.");
      loadRequests();
    } else {
      alert("Failed to reject request.");
    }
  }

  const filtered = requests.filter((r) => r.status === activeTab);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">License Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <p>Loading requests…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No {activeTab.toLowerCase()} requests.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Requested At</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">{req.productName}</td>
                  <td className="px-4 py-2">{req.userId}</td>
                  <td className="px-4 py-2">
                    {new Date(req.requestedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{req.status}</td>

                  <td className="px-4 py-2 space-x-3">
                    {activeTab === "PENDING" && (
                      <>
                        <button
                          onClick={() => approveRequest(req.id)}
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="text-red-600 hover:underline"
                        >
                          Reject
                        </button>

                        <input
                          type="text"
                          placeholder="Manual key (optional)"
                          value={manualKey}
                          onChange={(e) => setManualKey(e.target.value)}
                          className="border p-1 rounded ml-3"
                        />
                      </>
                    )}

                    {activeTab !== "PENDING" && (
                      <span className="text-slate-500 italic">
                        {req.processedby} at{" "}
                        {req.processedat
                          ? new Date(req.processedat).toLocaleString()
                          : "N/A"}
                      </span>
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
