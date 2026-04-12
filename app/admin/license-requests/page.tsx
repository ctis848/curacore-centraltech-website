"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LicenseRequest {
  id: string;
  user_email: string;
  product_name: string;
  machine_id: string | null;
  request_key: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  notes?: string | null;
}

const PAGE_SIZE = 10;

export default function AdminLicenseRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [filtered, setFiltered] = useState<LicenseRequest[]>([]);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<LicenseRequest | null>(null);

  // Bulk selection
  const [selected, setSelected] = useState<string[]>([]);

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectItem, setRejectItem] = useState<LicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/license-requests", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setRequests(data.requests);
        setFiltered(data.requests);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function applyFilters(tab: typeof activeTab, term: string) {
    let list = [...requests];

    if (tab !== "ALL") {
      list = list.filter((r) => r.status === tab);
    }

    if (term.trim()) {
      const q = term.toLowerCase();
      list = list.filter(
        (r) =>
          r.user_email.toLowerCase().includes(q) ||
          r.product_name.toLowerCase().includes(q) ||
          (r.machine_id || "").toLowerCase().includes(q) ||
          r.request_key.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
    setPage(1);
  }

  function handleTab(tab: typeof activeTab) {
    setActiveTab(tab);
    applyFilters(tab, search);
  }

  function handleSearch(term: string) {
    setSearch(term);
    applyFilters(activeTab, term);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Bulk Approve
  async function bulkApprove() {
    for (const id of selected) {
      await fetch("/api/license-request/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          licenseKey: "BULK-AUTO-GENERATED",
        }),
      });
    }
    setSelected([]);
    loadRequests();
  }

  // Bulk Reject
  async function bulkReject() {
    for (const id of selected) {
      await fetch("/api/license-request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          reason: "Bulk rejection",
        }),
      });
    }
    setSelected([]);
    loadRequests();
  }

  // Export CSV
  function exportCSV() {
    const headers = [
      "User",
      "Product",
      "Machine",
      "Status",
      "Request Key",
      "Created",
    ];

    const rows = filtered.map((r) => [
      r.user_email,
      r.product_name,
      r.machine_id || "N/A",
      r.status,
      r.request_key,
      new Date(r.created_at).toLocaleString(),
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "license_requests.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  // Confirm Reject
  async function confirmReject() {
    const res = await fetch("/api/license-request/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: rejectItem?.id,
        reason: rejectReason,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setRejectOpen(false);
      setRejectReason("");
      loadRequests();
    } else {
      alert(data.error);
    }
  }

  if (loading) return <p className="p-6">Loading requests...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-semibold">License Requests</h1>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="p-3 bg-gray-100 border rounded flex items-center gap-3">
          <span className="font-medium">{selected.length} selected</span>

          <button
            onClick={bulkApprove}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Bulk Approve
          </button>

          <button
            onClick={bulkReject}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Bulk Reject
          </button>
        </div>
      )}

      {/* Filters + Search + Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTab(tab as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by user, product, machine, key..."
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px]"
        />

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={pageItems.every((r) => selected.includes(r.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected([
                        ...new Set([
                          ...selected,
                          ...pageItems.map((r) => r.id),
                        ]),
                      ]);
                    } else {
                      setSelected(
                        selected.filter(
                          (id) => !pageItems.map((r) => r.id).includes(id)
                        )
                      );
                    }
                  }}
                />
              </th>
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Machine</th>
              <th className="p-3">Status</th>
              <th className="p-3">Request Key</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected([...selected, r.id]);
                      } else {
                        setSelected(selected.filter((id) => id !== r.id));
                      }
                    }}
                  />
                </td>

                <td className="p-3">{r.user_email}</td>
                <td className="p-3">{r.product_name}</td>
                <td className="p-3">{r.machine_id || "N/A"}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="p-3 truncate max-w-xs">{r.request_key}</td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setDetailItem(r);
                      setDetailOpen(true);
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs"
                  >
                    View
                  </button>

                  {r.status === "PENDING" && (
                    <button
                      onClick={() =>
                        router.push(`/admin/license-requests/approve/${r.id}`)
                      }
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Approve
                    </button>
                  )}

                  {r.status === "PENDING" && (
                    <button
                      onClick={() => {
                        setRejectItem(r);
                        setRejectOpen(true);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {detailOpen && detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-3">
            <h2 className="text-xl font-semibold mb-2">Request Details</h2>

            <p>
              <span className="font-semibold">User:</span>{" "}
              {detailItem.user_email}
            </p>
            <p>
              <span className="font-semibold">Product:</span>{" "}
              {detailItem.product_name}
            </p>
            <p>
              <span className="font-semibold">Machine ID:</span>{" "}
              {detailItem.machine_id || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {detailItem.status}
            </p>
            <p>
              <span className="font-semibold">Request Key:</span>{" "}
              {detailItem.request_key}
            </p>
            <p>
              <span className="font-semibold">Notes:</span>{" "}
              {detailItem.notes || "None"}
            </p>
            <p>
              <span className="font-semibold">Created:</span>{" "}
              {new Date(detailItem.created_at).toLocaleString()}
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDetailOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectOpen && rejectItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-red-700">
              Reject Request
            </h2>

            <p>
              Reject request from <strong>{rejectItem.user_email}</strong> for{" "}
              <strong>{rejectItem.product_name}</strong>?
            </p>

            <textarea
              className="w-full border p-2 rounded h-24"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
