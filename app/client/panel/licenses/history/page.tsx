"use client";

import { useEffect, useMemo, useState } from "react";

type LicenseHistory = {
  id: string;
  license_key: string;
  product_name: string;
  status: string;
  activated_at: string;
};

const PAGE_SIZE = 20;

export default function LicenseHistoryPage() {
  const [history, setHistory] = useState<LicenseHistory[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState<"product" | "status" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    product_name: true,
    license_key: true,
    status: true,
    activated_at: true,
  });

  // Fetch license history
  useEffect(() => {
    fetch("/api/client/licenses/history", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setHistory(d.history || []));
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

    return history.filter((h) => {
      const key = h.license_key?.toLowerCase() || "";
      const product = h.product_name?.toLowerCase() || "";
      const status = h.status?.toLowerCase() || "";
      return key.includes(q) || product.includes(q) || status.includes(q);
    });
  }, [history, debouncedSearch]);

  // SORTING
  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      switch (sortBy) {
        case "product":
          av = a.product_name?.toLowerCase() || "";
          bv = b.product_name?.toLowerCase() || "";
          break;
        case "status":
          av = a.status?.toLowerCase() || "";
          bv = b.status?.toLowerCase() || "";
          break;
        case "date":
          av = new Date(a.activated_at).getTime();
          bv = new Date(b.activated_at).getTime();
          break;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCol = (key: keyof typeof visibleCols) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const changeSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // FIXED + SAFE STATUS BADGE
  const statusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "unknown";

    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      expired: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
      revoked: "bg-gray-300 text-gray-700",
      unknown: "bg-gray-200 text-gray-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[s] || colors["unknown"]
        }`}
      >
        {s.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">License History</h1>

      {/* SEARCH + COLUMN TOGGLE */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold mr-1">Columns:</span>

          {(
            [
              ["product_name", "Product"],
              ["license_key", "License Key"],
              ["status", "Status"],
              ["activated_at", "Date"],
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
      </div>

      {/* EMPTY STATE */}
      {sorted.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          <p className="text-lg font-semibold">No license history found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* TABLE */}
      {sorted.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {visibleCols.product_name && (
                  <Th
                    label="Product"
                    active={sortBy === "product"}
                    dir={sortDir}
                    onClick={() => changeSort("product")}
                  />
                )}
                {visibleCols.license_key && (
                  <th className="px-4 py-2 text-left">License Key</th>
                )}
                {visibleCols.status && (
                  <Th
                    label="Status"
                    active={sortBy === "status"}
                    dir={sortDir}
                    onClick={() => changeSort("status")}
                  />
                )}
                {visibleCols.activated_at && (
                  <Th
                    label="Activated"
                    active={sortBy === "date"}
                    dir={sortDir}
                    onClick={() => changeSort("date")}
                  />
                )}
              </tr>
            </thead>

            <tbody>
              {paged.map((h) => (
                <tr key={h.id} className="border-b hover:bg-gray-50">
                  {visibleCols.product_name && (
                    <td className="px-4 py-2">{h.product_name}</td>
                  )}
                  {visibleCols.license_key && (
                    <td className="px-4 py-2 font-mono">{h.license_key}</td>
                  )}
                  {visibleCols.status && (
                    <td className="px-4 py-2">{statusBadge(h.status)}</td>
                  )}
                  {visibleCols.activated_at && (
                    <td className="px-4 py-2">
                      {new Date(h.activated_at).toLocaleString()}
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
            Page {page} of {totalPages} — {sorted.length} records
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
      className="px-4 py-2 text-left cursor-pointer select-none hover:text-teal-700"
      onClick={onClick}
    >
      {label} {active && (dir === "asc" ? "▲" : "▼")}
    </th>
  );
}
