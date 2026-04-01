"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Request = {
  id: string;
  request_key: string;
  status: string;
  product_name: string | null;
  clients?: {
    name?: string | null;
    email?: string | null;
  };
};

const PAGE_SIZE = 20;

export default function AdminLicenseRequestsTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  const [sortBy, setSortBy] = useState<"client" | "product" | "status">("client");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    client: true,
    email: true,
    product: true,
    request_key: true,
    status: true,
    actions: true,
  });

  // Fetch requests
  useEffect(() => {
    fetch("/api/admin/license-requests", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRequests(Array.isArray(d.requests) ? d.requests : []));
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // FILTERING (null-safe)
  const filtered = useMemo(() => {
    const q = debouncedSearch;

    return requests.filter((r) => {
      const key = r.request_key?.toLowerCase() || "";
      const email = r.clients?.email?.toLowerCase() || "";
      const product = r.product_name?.toLowerCase() || "";
      const client = r.clients?.name?.toLowerCase() || "";

      const matchesSearch =
        key.includes(q) || email.includes(q) || product.includes(q) || client.includes(q);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;

      const matchesProduct =
        productFilter === "all" ||
        product === productFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [requests, debouncedSearch, statusFilter, productFilter]);

  // SORTING
  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      const getVal = (r: Request) => {
        switch (sortBy) {
          case "client":
            return r.clients?.name?.toLowerCase() || "";
          case "product":
            return r.product_name?.toLowerCase() || "";
          case "status":
            return r.status?.toLowerCase() || "";
          default:
            return "";
        }
      };

      const av = getVal(a);
      const bv = getVal(b);

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const toggleCol = (key: keyof typeof visibleCols) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // STATUS BADGE (safe)
  const badge = (status?: string) => {
    const s = status?.toLowerCase() || "unknown";

    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      unknown: "bg-gray-200 text-gray-700",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[s] || colors.unknown}`}>
        {s.toUpperCase()}
      </span>
    );
  };

  // CSV EXPORT
  const exportCSV = () => {
    const rows = [
      ["Client", "Email", "Product", "Request Key", "Status"],
      ...sorted.map((r) => [
        r.clients?.name || "",
        r.clients?.email || "",
        r.product_name || "",
        r.request_key || "",
        r.status || "",
      ]),
    ];

    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "license_requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">License Requests</h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="all">All Products</option>
          {[...new Set(requests.map((r) => r.product_name))].map(
            (p) =>
              p && (
                <option key={p} value={p}>
                  {p}
                </option>
              )
          )}
        </select>

        {/* Column toggles */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold">Columns:</span>
          {(
            [
              ["client", "Client"],
              ["email", "Email"],
              ["product", "Product"],
              ["request_key", "Request Key"],
              ["status", "Status"],
              ["actions", "Actions"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={visibleCols[key]}
                onChange={() => toggleCol(key)}
              />
              {label}
            </label>
          ))}
        </div>

        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* EMPTY STATE */}
      {sorted.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          <p className="text-lg font-semibold">No license requests found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* TABLE */}
      {sorted.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {visibleCols.client && (
                  <Th
                    label="Client"
                    active={sortBy === "client"}
                    dir={sortDir}
                    onClick={() => changeSort("client")}
                  />
                )}
                {visibleCols.email && <th className="p-2 text-left">Email</th>}
                {visibleCols.product && (
                  <Th
                    label="Product"
                    active={sortBy === "product"}
                    dir={sortDir}
                    onClick={() => changeSort("product")}
                  />
                )}
                {visibleCols.request_key && <th className="p-2 text-left">Request Key</th>}
                {visibleCols.status && (
                  <Th
                    label="Status"
                    active={sortBy === "status"}
                    dir={sortDir}
                    onClick={() => changeSort("status")}
                  />
                )}
                {visibleCols.actions && <th className="p-2 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {paged.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  {visibleCols.client && (
                    <td className="p-2">{r.clients?.name || "Unknown"}</td>
                  )}
                  {visibleCols.email && (
                    <td className="p-2">{r.clients?.email || "N/A"}</td>
                  )}
                  {visibleCols.product && (
                    <td className="p-2">{r.product_name || "N/A"}</td>
                  )}
                  {visibleCols.request_key && (
                    <td className="p-2 font-mono text-xs">{r.request_key}</td>
                  )}
                  {visibleCols.status && (
                    <td className="p-2">{badge(r.status)}</td>
                  )}
                  {visibleCols.actions && (
                    <td className="p-2">
                      <Link
                        href={`/admin/generate-license?request=${r.id}`}
                        className={`px-3 py-1 rounded text-white ${
                          r.status === "pending" ? "bg-teal-600" : "bg-gray-600"
                        }`}
                      >
                        {r.status === "pending" ? "Review" : "View"}
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span>
            Page {page} of {totalPages} — {sorted.length} requests
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      className="p-2 text-left cursor-pointer select-none hover:text-teal-700"
      onClick={onClick}
    >
      {label} {active && (dir === "asc" ? "▲" : "▼")}
    </th>
  );
}
