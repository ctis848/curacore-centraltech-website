"use client";

import { useEffect, useState, useMemo } from "react";

type LicenseStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LicenseRequestRow {
  id: string;
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
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof LicenseRequestRow>("requestedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  async function loadRequests() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/license-requests?status=${activeTab}`, {
        cache: "no-store",
      });

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
    if (!manualKey?.trim()) {
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
    if (!confirm("Are you sure you want to reject this request?")) return;

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

  // SEARCH + SORT + FILTER
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();

    let list = requests.filter((r) =>
      activeTab === "ALL" ? true : r.status === activeTab
    );

    if (s) {
      list = list.filter((r) =>
        [
          r.companyName,
          r.userEmail,
          r.userId,
          r.productName,
          r.requestKey,
        ]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(s))
      );
    }

    list.sort((a, b) => {
      const A = (a[sortKey] || "").toString().toLowerCase();
      const B = (b[sortKey] || "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [requests, activeTab, search, sortKey, sortDir]);

  function toggleSort(key: keyof LicenseRequestRow) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">License Management</h1>

      {/* TABS */}
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

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search company, email, product, key, user ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border rounded w-full mb-4"
      />

      {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="text-left">
                {[
                  ["companyName", "Company"],
                  ["userEmail", "User Email"],
                  ["userId", "User ID"],
                  ["productName", "Product"],
                  ["requestKey", "Request Key"],
                  ["status", "Status"],
                  ["requestedAt", "Requested"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key as keyof LicenseRequestRow)}
                    className="p-3 cursor-pointer select-none"
                  >
                    {label}{" "}
                    {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">{req.companyName || "—"}</td>
                  <td className="p-3">{req.userEmail || "—"}</td>
                  <td className="p-3">{req.userId}</td>
                  <td className="p-3">{req.productName || "Unknown"}</td>

                  {/* COPY-FRIENDLY REQUEST KEY */}
                  <td className="p-3 font-mono text-xs break-all">
                    <div className="flex items-center gap-2">
                      <span className="select-text">
                        {req.requestKey || "—"}
                      </span>
                      {req.requestKey && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(req.requestKey!)
                          }
                          className="px-2 py-1 text-xs border rounded hover:bg-slate-100"
                        >
                          Copy
                        </button>
                      )}
                    </div>
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

                  {/* ACTIONS */}
                  <td className="p-3">
                    {req.status === "PENDING" ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Manual key"
                          className="border px-2 py-1 rounded text-sm w-40"
                          value={req.manualKey || ""}
                          onChange={(e) =>
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === req.id
                                  ? { ...r, manualKey: e.target.value }
                                  : r
                              )
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            handleApprove(req.id, req.manualKey)
                          }
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
                      </div>
                    ) : req.status === "APPROVED" ? (
                      <span className="text-green-700 text-sm">Approved</span>
                    ) : (
                      <span className="text-red-700 text-sm">Rejected</span>
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
