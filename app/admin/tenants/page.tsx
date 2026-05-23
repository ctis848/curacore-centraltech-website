"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface TenantRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  status: string;
}

export default function TenantsPage() {
  const supabase = supabaseBrowser();

  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState<"name" | "email" | "createdAt">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("Tenant")
      .select("*")
      .order("createdAt", { ascending: false });

    if (!error && data) {
      setTenants(data as TenantRow[]);
    }

    setLoading(false);
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();

    return tenants.filter((t) => {
      const matchesStatus = statusFilter ? t.status === statusFilter : true;
      const matchesSearch =
        !s ||
        t.name.toLowerCase().includes(s) ||
        t.email?.toLowerCase().includes(s) ||
        t.phone?.toLowerCase().includes(s);

      return matchesStatus && matchesSearch;
    });
  }, [tenants, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const A = (a[sortKey] || "").toString().toLowerCase();
      const B = (b[sortKey] || "").toString().toLowerCase();

      if (A < B) return sortDirection === "asc" ? -1 : 1;
      if (A > B) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDirection]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Tenants
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg shadow-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-purple-400"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
            <tr className="border-b text-slate-700">

              <th
                className="p-4 text-left cursor-pointer font-semibold"
                onClick={() => setSortKey("name")}
              >
                Name {sortKey === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                className="p-4 text-left cursor-pointer font-semibold"
                onClick={() => setSortKey("email")}
              >
                Email {sortKey === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th className="p-4 text-left font-semibold">Phone</th>

              <th
                className="p-4 text-left cursor-pointer font-semibold"
                onClick={() => setSortKey("createdAt")}
              >
                Created {sortKey === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th className="p-4 text-left font-semibold">Status</th>

              <th className="p-4 text-left font-semibold">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading tenants…
                </td>
              </tr>
            )}

            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No tenants found.
                </td>
              </tr>
            )}

            {!loading &&
              paginated.map((t) => (
                <tr
                  key={t.id}
                  className="border-b hover:bg-slate-50 transition even:bg-slate-50/30"
                >
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4">{t.email || "—"}</td>
                  <td className="p-4">{t.phone || "—"}</td>
                  <td className="p-4">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        t.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <a
                      href={`/admin/tenants/${t.id}`}
                      className="text-teal-600 hover:underline font-medium"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 border rounded-lg ${
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-50"
            }`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded-lg ${
                  p === page
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 border rounded-lg ${
              page === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
