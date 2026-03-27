"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  tenantId?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

type SortKey = "name" | "email" | "role" | "createdAt";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tenantFilter, setTenantFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/users").then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([usersData, tenantsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSortedUsers = useMemo(() => {
    let data = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name ?? "").toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "ALL") {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (tenantFilter !== "ALL") {
      data = data.filter((u) => u.tenantId === tenantFilter);
    }

    data.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (sortKey === "createdAt") {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [users, search, roleFilter, tenantFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedUsers.length / pageSize));
  const pageUsers = filteredSortedUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await fetch(`/admin/api/users/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setConfirmDelete(null);
    } catch {}
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading users...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Users</h1>

        {/* Filters & search */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
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
          {pageUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No users found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("name")}>
                    Name
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("email")}>
                    Email
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("role")}>
                    Role
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Created
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{user.name || "—"}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button
                        className="text-green-600 dark:text-green-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
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

        {/* View modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                User Details
              </h2>
              <p className="dark:text-white">
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p className="dark:text-white">
                <strong>Name:</strong> {selectedUser.name || "—"}
              </p>
              <p className="dark:text-white">
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p className="dark:text-white">
                <strong>Created:</strong>{" "}
                {new Date(selectedUser.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Delete User
              </h2>
              <p className="dark:text-white">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{confirmDelete.email}</span>?
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
