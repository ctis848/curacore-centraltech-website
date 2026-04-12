"use client";

import { useEffect, useMemo, useState } from "react";

type License = {
  id: string;
  productName: string;
  licenseKey: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  activationCount: number;
  maxActivations: number | null;
};

const PAGE_SIZE = 20;

export default function AllLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"product" | "status" | "expires">("product");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    product: true,
    licenseKey: true,
    status: true,
    expires: true,
    actions: true,
  });

  // Fetch all licenses
  useEffect(() => {
    fetch("/api/client/licenses/all", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setLicenses(d.licenses || []));
  }, []);

  // SEARCH
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return licenses.filter(
      (l) =>
        l.licenseKey.toLowerCase().includes(q) ||
        l.productName.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [licenses, search]);

  // SORTING
  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortBy === "product") {
        av = a.productName.toLowerCase();
        bv = b.productName.toLowerCase();
      } else if (sortBy === "status") {
        av = a.status.toLowerCase();
        bv = b.status.toLowerCase();
      } else {
        av = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
        bv = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
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

  const exportCSV = () => {
    const rows = [
      ["Product", "License Key", "Status", "Expires"],
      ...sorted.map((l) => [
        l.productName,
        l.licenseKey,
        l.status,
        l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : "N/A",
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "all_licenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      EXPIRED: "bg-red-100 text-red-700",
      GRACE: "bg-orange-100 text-orange-700",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || "bg-gray-200"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">All Licenses</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search licenses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold mr-1">Columns:</span>
          {(
            [
              ["product", "Product"],
              ["licenseKey", "License Key"],
              ["status", "Status"],
              ["expires", "Expires"],
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
          <p className="text-lg font-semibold">No licenses found</p>
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
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("product")}
                  >
                    Product{" "}
                    {sortBy === "product" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.licenseKey && (
                  <th className="px-4 py-2 text-left">License Key</th>
                )}
                {visibleCols.status && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("status")}
                  >
                    Status{" "}
                    {sortBy === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.expires && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("expires")}
                  >
                    Expires{" "}
                    {sortBy === "expires" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.actions && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paged.map((l) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  {visibleCols.product && (
                    <td className="px-4 py-2">{l.productName}</td>
                  )}
                  {visibleCols.licenseKey && (
                    <td className="px-4 py-2 font-mono">{l.licenseKey}</td>
                  )}
                  {visibleCols.status && (
                    <td className="px-4 py-2">{statusBadge(l.status)}</td>
                  )}
                  {visibleCols.expires && (
                    <td className="px-4 py-2">
                      {l.expiresAt
                        ? new Date(l.expiresAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td className="px-4 py-2">
                      <a
                        href={`/client/panel/licenses/${l.licenseKey}`}
                        className="text-blue-600 underline text-sm"
                      >
                        View Details
                      </a>
                    </td>
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
            Page {page} of {totalPages} — {sorted.length} licenses
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
