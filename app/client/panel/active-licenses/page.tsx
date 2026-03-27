"use client";

import { useEffect, useMemo, useState } from "react";

type License = {
  id: string;
  licenseKey: string;
  productName: string;
  machineId: string;
  status: string;
  expiresAt?: string | null;
};

const PAGE_SIZE = 20;

export default function ActiveLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"product" | "expires">("product");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    product: true,
    licenseKey: true,
    expires: true,
    actions: true,
  });

  useEffect(() => {
    fetch("/api/client/licenses/active", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setLicenses(d.licenses || []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return licenses.filter(
      (lic) =>
        lic.licenseKey.toLowerCase().includes(q) ||
        lic.productName.toLowerCase().includes(q) ||
        lic.machineId.toLowerCase().includes(q)
    );
  }, [licenses, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortBy === "product") {
        av = a.productName.toLowerCase();
        bv = b.productName.toLowerCase();
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
      ["Product", "License Key", "Machine ID", "Expires"],
      ...sorted.map((lic) => [
        lic.productName,
        lic.licenseKey,
        lic.machineId,
        lic.expiresAt
          ? new Date(lic.expiresAt).toLocaleDateString()
          : "N/A",
      ]),
    ];

    const csv = rows
      .map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "active_licenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Licenses</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search active licenses..."
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
        <p className="text-gray-600">No active licenses found.</p>
      )}

      {/* Table */}
      {sorted.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                {visibleCols.product && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("product")}
                  >
                    Product{" "}
                    {sortBy === "product"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )}
                {visibleCols.licenseKey && (
                  <th className="px-4 py-2 text-left">License Key</th>
                )}
                {visibleCols.expires && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("expires")}
                  >
                    Expires{" "}
                    {sortBy === "expires"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )}
                {visibleCols.actions && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paged.map((lic) => (
                <tr key={lic.id} className="border-b hover:bg-gray-50">
                  {visibleCols.product && (
                    <td className="px-4 py-2">{lic.productName}</td>
                  )}
                  {visibleCols.licenseKey && (
                    <td className="px-4 py-2 font-mono">{lic.licenseKey}</td>
                  )}
                  {visibleCols.expires && (
                    <td className="px-4 py-2">
                      {lic.expiresAt
                        ? new Date(lic.expiresAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td className="px-4 py-2">
                      <a
                        href={`/client/panel/licenses/${lic.id}`}
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
            Page {page} of {totalPages} — {sorted.length} active licenses
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
