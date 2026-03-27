"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

type SortKey = "name" | "createdAt";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null);

  useEffect(() => {
    fetch("/admin/api/tenants")
      .then((r) => r.json())
      .then((data) => setTenants(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...tenants];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) => t.name.toLowerCase().includes(q));
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
  }, [tenants, search, sortKey, sortDir]);

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

  const handleDelete = async (tenant: Tenant) => {
    try {
      await fetch(`/admin/api/tenants/${tenant.id}`, { method: "DELETE" });
      setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      setConfirmDelete(null);
    } catch {}
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading tenants...</p>;
  }

  return (
    <RequireRole role="SUPER_ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Tenants</h1>

        {/* Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
          {pageData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No tenants found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("name")}>
                    Name
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Created
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{tenant.name}</td>
                    <td className="p-3">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setSelectedTenant(tenant)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button className="text-green-600 dark:text-green-400">
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(tenant)}
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
        {selectedTenant && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Tenant Details
              </h2>

              <p className="dark:text-white">
                <strong>Name:</strong> {selectedTenant.name}
              </p>
              <p className="dark:text-white">
                <strong>ID:</strong> {selectedTenant.id}
              </p>
              <p className="dark:text-white">
                <strong>Created:</strong>{" "}
                {new Date(selectedTenant.createdAt).toLocaleString()}
              </p>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedTenant(null)}
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
                Delete Tenant
              </h2>
              <p className="dark:text-white">
                Are you sure you want to delete tenant{" "}
                <strong>{confirmDelete.name}</strong>?
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
