"use client";

import { useEffect, useState } from "react";

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, [search, status, page]);

  async function load() {
    const res = await fetch(
      `/api/admin/licenses?search=${search}&status=${status}&page=${page}`
    );
    const data = await res.json();
    setLicenses(data.licenses ?? []);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">License Management</h1>

      <div className="flex gap-4">
        <input
          placeholder="Search by ID, user, plan..."
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="space-y-3">
        {licenses.map((l: any) => (
          <div key={l.id} className="border p-4 rounded bg-white">
            <p><strong>ID:</strong> {l.id}</p>
            <p><strong>User:</strong> {l.user_id ?? "Unassigned"}</p>
            <p><strong>Status:</strong> {l.is_active ? "Active" : "Inactive"}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
