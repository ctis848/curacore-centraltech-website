"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface License {
  id: string;
  licenseKey: string;
  productName: string;
  machineId: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  user?: { email: string };
  tenantId?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

type SortKey =
  | "licenseKey"
  | "productName"
  | "status"
  | "expiresAt"
  | "createdAt";

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tenantFilter, setTenantFilter] = useState("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<License | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/licenses").then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([licensesData, tenantsData]) => {
        setLicenses(Array.isArray(licensesData) ? licensesData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...licenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.licenseKey.toLowerCase().includes(q) ||
          l.productName.toLowerCase().includes(q) ||
          (l.user?.email ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((l) => l.status === statusFilter);
    }

    if (tenantFilter !== "ALL") {
      data = data.filter((l) => l.tenantId === tenantFilter);
    }

    data.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (sortKey === "createdAt" || sortKey === "expiresAt") {
        const aDate = aVal ? new Date(aVal).getTime() : 0;
        const bDate = bVal ? new Date(bVal).getTime() : 0;
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [licenses, search, statusFilter, tenantFilter, sortKey, sortDir]);

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

  const handleDelete = async (lic: License) => {
    try {
      await fetch(`/admin/api/licenses/${lic.id}`, { method: "DELETE" });
      setLicenses((prev) => prev.filter((l) => l.id !== lic.id));
      setConfirmDelete(null);
    } catch {}
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading licenses...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Licenses</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by key, product, or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
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
            <p className="text-gray-500 dark:text-gray-300">No licenses found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("licenseKey")}>
                    License Key
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("productName")}>
                    Product
                  </th>
                  <th className="p-3">User</th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("status")}>
                    Status
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("expiresAt")}>
                    Expires
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Created
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((lic) => (
                  <tr
                    key={lic.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{lic.licenseKey}</td>
                    <td className="p-3">{lic.productName}</td>
                    <td className="p-3">{lic.user?.email ?? "—"}</td>
                    <td className="p-3">{lic.status}</td>
                    <td className="p-3">
                      {lic.expiresAt
                        ? new Date(lic.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3">
                      {new Date(lic.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setSelectedLicense(lic)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button className="text-green-600 dark:text-green-400">
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(lic)}
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
        {selectedLicense && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                License Details
              </h2>

              <p className="dark:text-white">
                <strong>Key:</strong> {selectedLicense.licenseKey}
              </p>
              <p className="dark:text-white">
                <strong>Product:</strong> {selectedLicense.productName}
              </p>
              <p className="dark:text-white">
                <strong>User:</strong> {selectedLicense.user?.email ?? "—"}
              </p>
              <p className="dark:text-white">
                <strong>Status:</strong> {selectedLicense.status}
              </p>
              <p className="dark:text-white">
                <strong>Expires:</strong>{" "}
                {selectedLicense.expiresAt
                  ? new Date(selectedLicense.expiresAt).toLocaleString()
                  : "—"}
              </p>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedLicense(null)}
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
                Delete License
              </h2>
              <p className="dark:text-white">
                Are you sure you want to delete license{" "}
                <strong>{confirmDelete.licenseKey}</strong>?
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
