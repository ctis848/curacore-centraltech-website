"use client";

import { useEffect, useMemo, useState } from "react";

type License = {
  licenseKey: string;
  productName: string;
  status: string;
  requestedAt: string;
};

const PAGE_SIZE = 20;

export default function PendingLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState<"product" | "requested">("requested");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    product: true,
    licenseKey: true,
    requestedAt: true,
    actions: true,
  });

  // Fetch pending licenses
  useEffect(() => {
    fetch("/api/client/licenses/pending", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLicenses(d.licenses || []));
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // SEARCH FILTER (null-safe)
  const filtered = useMemo(() => {
    const q = debouncedSearch;

    return licenses.filter((l) => {
      const key = l.licenseKey?.toLowerCase() || "";
      const product = l.productName?.toLowerCase() || "";
      return key.includes(q) || product.includes(q);
    });
  }, [licenses, debouncedSearch]);

  // SORTING
  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortBy === "product") {
        av = a.productName?.toLowerCase() || "";
        bv = b.productName?.toLowerCase() || "";
      } else {
        av = new Date(a.requestedAt).getTime();
        bv = new Date(b.requestedAt).getTime();
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

  // CSV EXPORT
  const exportCSV = () => {
    const rows = [
      ["Product", "License Key", "Requested"],
      ...sorted.map((l) => [
        l.productName,
        l.licenseKey,
        new Date(l.requestedAt).toLocaleString(),
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pending_licenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const badge = () => (
    <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
      PENDING
    </span>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">Pending Licenses</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search pending licenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold mr-1">Columns:</span>
          {(
            [
              ["product", "Product"],
              ["licenseKey", "License Key"],
              ["requestedAt", "Requested"],
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

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          <p className="text-lg font-semibold">No pending licenses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Table */}
      {sorted.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {visibleCols.product && (
                  <Th
                    label="Product"
                    active={sortBy === "product"}
                    dir={sortDir}
                    onClick={() => changeSort("product")}
                  />
                )}
                {visibleCols.licenseKey && (
                  <th className="px-4 py-2 text-left">License Key</th>
                )}
                {visibleCols.requestedAt && (
                  <Th
                    label="Requested"
                    active={sortBy === "requested"}
                    dir={sortDir}
                    onClick={() => changeSort("requested")}
                  />
                )}
                {visibleCols.actions && (
                  <th className="px-4 py-2 text-left">Status</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paged.map((l) => (
                <tr key={l.licenseKey} className="border-b hover:bg-gray-50">
                  {visibleCols.product && (
                    <td className="px-4 py-2">{l.productName}</td>
                  )}
                  {visibleCols.licenseKey && (
                    <td className="px-4 py-2 font-mono">{l.licenseKey}</td>
                  )}
                  {visibleCols.requestedAt && (
                    <td className="px-4 py-2">
                      {new Date(l.requestedAt).toLocaleString()}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td className="px-4 py-2">{badge()}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span>
            Page {page} of {totalPages} — {sorted.length} pending licenses
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
