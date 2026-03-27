"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface SystemLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number | null;
  createdAt: string;
  tenantId?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

type SortKey = "endpoint" | "method" | "statusCode" | "responseTime" | "createdAt";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tenantFilter, setTenantFilter] = useState("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/system-logs").then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([logData, tenantData]) => {
        setLogs(Array.isArray(logData) ? logData : []);
        setTenants(Array.isArray(tenantData) ? tenantData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...logs];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.endpoint.toLowerCase().includes(q) ||
          l.method.toLowerCase().includes(q)
      );
    }

    if (methodFilter !== "ALL") {
      data = data.filter((l) => l.method === methodFilter);
    }

    if (statusFilter !== "ALL") {
      data = data.filter((l) => String(l.statusCode) === statusFilter);
    }

    if (tenantFilter !== "ALL") {
      data = data.filter((l) => l.tenantId === tenantFilter);
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Safe date sorting
      if (sortKey === "createdAt") {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0;
        const bDate = bVal ? new Date(bVal as string).getTime() : 0;
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Safe numeric sorting
      if (sortKey === "statusCode" || sortKey === "responseTime") {
        const aNum = typeof aVal === "number" ? aVal : 0;
        const bNum = typeof bVal === "number" ? bVal : 0;
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String sorting
      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [logs, search, methodFilter, statusFilter, tenantFilter, sortKey, sortDir]);

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

  if (loading) {
    return <p className="p-6 dark:text-white">Loading system logs...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">System Logs</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by endpoint or method..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />

          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All statuses</option>
            <option value="200">200</option>
            <option value="400">400</option>
            <option value="401">401</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="500">500</option>
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

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
          {pageData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No logs found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("endpoint")}>
                    Endpoint
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("method")}>
                    Method
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("statusCode")}>
                    Status
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("responseTime")}>
                    Time (ms)
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Date
                  </th>
                  <th className="p-3">View</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{log.endpoint}</td>
                    <td className="p-3">{log.method}</td>
                    <td className="p-3">{log.statusCode}</td>
                    <td className="p-3">{log.responseTime ?? "—"}</td>

                    {/* Safe date rendering */}
                    <td className="p-3">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
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
        {selectedLog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Log Details
              </h2>

              <p className="dark:text-white">
                <strong>Endpoint:</strong> {selectedLog.endpoint}
              </p>
              <p className="dark:text-white">
                <strong>Method:</strong> {selectedLog.method}
              </p>
              <p className="dark:text-white">
                <strong>Status:</strong> {selectedLog.statusCode}
              </p>
              <p className="dark:text-white">
                <strong>Response Time:</strong>{" "}
                {selectedLog.responseTime ?? "—"} ms
              </p>

              {/* Safe date rendering */}
              <p className="dark:text-white">
                <strong>Date:</strong>{" "}
                {selectedLog.createdAt
                  ? new Date(selectedLog.createdAt).toLocaleString()
                  : "—"}
              </p>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
