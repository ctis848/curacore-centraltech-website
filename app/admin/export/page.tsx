"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface ExportRecord {
  id: string;
  fileName: string;
  dataset: string;
  createdAt: string;
  tenantId?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

type SortKey = "fileName" | "dataset" | "createdAt";

export default function CSVExportPage() {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [datasetFilter, setDatasetFilter] = useState("ALL");
  const [tenantFilter, setTenantFilter] = useState("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedRecord, setSelectedRecord] = useState<ExportRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExportRecord | null>(null);

  const exportOptions = [
    { label: "Users", endpoint: "/admin/api/export/users", dataset: "users" },
    { label: "Licenses", endpoint: "/admin/api/export/licenses", dataset: "licenses" },
    { label: "License Requests", endpoint: "/admin/api/export/license-requests", dataset: "license_requests" },
    { label: "Audit Logs", endpoint: "/admin/api/export/audit-logs", dataset: "audit_logs" },
    { label: "Tenants", endpoint: "/admin/api/export/tenants", dataset: "tenants" },
    { label: "System Logs", endpoint: "/admin/api/export/system-logs", dataset: "system_logs" },
  ];

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/export/history").then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([historyData, tenantData]) => {
        setHistory(Array.isArray(historyData) ? historyData : []);
        setTenants(Array.isArray(tenantData) ? tenantData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...history];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.fileName.toLowerCase().includes(q) ||
          h.dataset.toLowerCase().includes(q)
      );
    }

    if (datasetFilter !== "ALL") {
      data = data.filter((h) => h.dataset === datasetFilter);
    }

    if (tenantFilter !== "ALL") {
      data = data.filter((h) => h.tenantId === tenantFilter);
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "createdAt") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aStr = aVal.toLowerCase();
      const bStr = bVal.toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [history, search, datasetFilter, tenantFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageData = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const triggerExport = async (option: any) => {
    window.location.href = option.endpoint;

    await fetch("/admin/api/export/history", {
      method: "POST",
      body: JSON.stringify({
        dataset: option.dataset,
        fileName: `${option.dataset}_${Date.now()}.csv`,
      }),
    });

    const updated = await fetch("/admin/api/export/history").then((r) => r.json());
    setHistory(updated);
  };

  const handleDelete = async (record: ExportRecord) => {
    await fetch(`/admin/api/export/history/${record.id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((h) => h.id !== record.id));
    setConfirmDelete(null);
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading export tools...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">CSV Export</h1>

        {/* Export Buttons */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-6 space-y-4">
          {exportOptions.map((opt) => (
            <button
              key={opt.dataset}
              onClick={() => triggerExport(opt)}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Export {opt.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search export history..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />

          <select
            value={datasetFilter}
            onChange={(e) => {
              setDatasetFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All datasets</option>
            {exportOptions.map((opt) => (
              <option key={opt.dataset} value={opt.dataset}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export History Table */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
          {pageData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No export history found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("fileName")}>
                    File Name
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("dataset")}>
                    Dataset
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Created
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{rec.fileName}</td>
                    <td className="p-3">{rec.dataset}</td>
                    <td className="p-3">
                      {new Date(rec.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button
                        onClick={() => (window.location.href = `/admin/api/export/download/${rec.id}`)}
                        className="text-green-600 dark:text-green-400"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setConfirmDelete(rec)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-white"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* View Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Export Details
              </h2>

              <p className="dark:text-white">
                <strong>File:</strong> {selectedRecord.fileName}
              </p>
              <p className="dark:text-white">
                <strong>Dataset:</strong> {selectedRecord.dataset}
              </p>
              <p className="dark:text-white">
                <strong>Created:</strong>{" "}
                {new Date(selectedRecord.createdAt).toLocaleString()}
              </p>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Delete Export Record
              </h2>
              <p className="dark:text-white">
                Are you sure you want to delete{" "}
                <strong>{confirmDelete.fileName}</strong>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
