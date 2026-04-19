"use client";

import { useEffect, useState } from "react";
import type { LicenseRequestRow } from "@/types/admin";

export default function LicenseRequestsPage() {
  const [requests, setRequests] = useState<LicenseRequestRow[]>([]);
  const [filtered, setFiltered] = useState<LicenseRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [copiedKey, setCopiedKey] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    const res = await fetch("/api/admin/license-requests", { cache: "no-store" });
    const { data } = await res.json();
    setRequests(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }

  function handleSearch(value: string) {
    setSearch(value);
    applyFilters(value, statusFilter, sortOrder);
  }

  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    applyFilters(search, value, sortOrder);
  }

  function handleSort(value: string) {
    setSortOrder(value);
    applyFilters(search, statusFilter, value);
  }

  function applyFilters(searchValue: string, status: string, sort: string) {
    let data = [...requests];

    // Search
    const q = searchValue.toLowerCase();
    data = data.filter(
      (r) =>
        r.productName?.toLowerCase().includes(q) ||
        r.requestKey.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );

    // Status filter
    if (status !== "ALL") {
      data = data.filter((r) => r.status === status);
    }

    // Sorting
    data.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "NEWEST" ? db - da : da - db;
    });

    setFiltered(data);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAllOnPage() {
    const ids = paginated.map((r) => r.id);
    setSelected(ids);
  }

  function clearSelection() {
    setSelected([]);
  }

  async function bulkAction(action: "approve" | "reject") {
    for (const id of selected) {
      await fetch(`/api/admin/license-requests/${id}/${action}`, {
        method: "POST",
      });
    }
    alert(`Bulk ${action} completed`);
    loadRequests();
    clearSelection();
  }

  function exportCSV() {
    const rows = [
      ["Product", "Request Key", "Status", "Created"],
      ...filtered.map((r) => [
        r.productName || "Unknown",
        r.requestKey,
        r.status,
        r.createdAt,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "license_requests.csv";
    a.click();
  }

  // Pagination
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  function StatusBadge({ status }: { status: string }) {
    const colors: any = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[status]}`}>
        {status}
      </span>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">License Requests</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="p-2 border rounded shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
        </select>

        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
        >
          Export CSV
        </button>
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => bulkAction("approve")}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Bulk Approve ({selected.length})
          </button>

          <button
            onClick={() => bulkAction("reject")}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Bulk Reject ({selected.length})
          </button>

          <button
            onClick={clearSelection}
            className="px-3 py-2 bg-slate-300 rounded hover:bg-slate-400"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-3">
                <input type="checkbox" onChange={selectAllOnPage} />
              </th>
              <th className="p-3">Product</th>
              <th className="p-3">Request Key</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((req) => (
              <tr key={req.id} className="border-t hover:bg-slate-50 transition">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(req.id)}
                    onChange={() => toggleSelect(req.id)}
                  />
                </td>

                <td className="p-3">{req.productName || "Unknown Product"}</td>

                <td className="p-3 flex items-center gap-2">
                  <span className="truncate max-w-[260px]">{req.requestKey}</span>

                  <button
                    onClick={() => copyKey(req.requestKey)}
                    className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
                    title="Copy to clipboard"
                  >
                    {copiedKey === req.requestKey ? "Copied!" : "Copy"}
                  </button>
                </td>

                <td className="p-3">
                  <StatusBadge status={req.status} />
                </td>

                <td className="p-3">
                  {new Date(req.createdAt).toLocaleString()}
                </td>

                <td className="p-3 flex gap-2">
                  <a
                    href={`/admin/license-requests/${req.id}/approve`}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Approve
                  </a>

                  {/* ⭐ View User Profile */}
                  <a
                    href={`/admin/users/${req.userId}`}
                    className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700"
                  >
                    User
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
