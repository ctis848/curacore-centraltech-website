"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type License = {
  licenseKey: string;
  productName: string;
  status: string;
  expiresAt?: string | null;
};

const PAGE_SIZE = 20;

export default function ClientLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "ACTIVE" | "EXPIRED" | "PENDING" | "GRACE">("ALL");
  const [sortBy, setSortBy] =
    useState<"product" | "status" | "expires">("product");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState({
    product: true,
    licenseKey: true,
    status: true,
    expires: true,
    actions: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------------------
     FETCH LICENSES FROM API
  ----------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("client_access_token");
        if (!token) {
          setError("Missing client access token. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/client/licenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to load licenses");
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Expecting: { licenses: [{ product_name, license_key, status, expires_at }] }
        const mapped: License[] = (data.licenses || []).map((lic: any) => ({
          productName: lic.product_name ?? lic.productName ?? "",
          licenseKey: lic.license_key ?? lic.licenseKey ?? "",
          status: lic.status ?? "UNKNOWN",
          expiresAt: lic.expires_at ?? lic.expiresAt ?? null,
        }));

        setLicenses(mapped);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
        setLoading(false);
      }
    }

    load();
  }, []);

  /* -----------------------------------------
     DEBOUNCE SEARCH
  ----------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /* -----------------------------------------
     FILTERING
  ----------------------------------------- */
  const filtered = useMemo(() => {
    return licenses.filter((lic) => {
      if (statusFilter !== "ALL" && lic.status.toUpperCase() !== statusFilter)
        return false;

      const q = debouncedSearch;
      const key = lic.licenseKey?.toLowerCase() || "";
      const product = lic.productName?.toLowerCase() || "";

      return key.includes(q) || product.includes(q);
    });
  }, [licenses, debouncedSearch, statusFilter]);

  /* -----------------------------------------
     SORTING
  ----------------------------------------- */
  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortBy === "product") {
        av = a.productName?.toLowerCase() || "";
        bv = b.productName?.toLowerCase() || "";
      } else if (sortBy === "status") {
        av = a.status?.toLowerCase() || "";
        bv = b.status?.toLowerCase() || "";
      } else if (sortBy === "expires") {
        av = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
        bv = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  /* -----------------------------------------
     PAGINATION
  ----------------------------------------- */
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

  /* -----------------------------------------
     CSV EXPORT
  ----------------------------------------- */
  const exportCSV = () => {
    const rows = [
      ["Product", "License Key", "Status", "Expires"],
      ...sorted.map((lic) => [
        lic.productName,
        lic.licenseKey,
        lic.status,
        lic.expiresAt
          ? new Date(lic.expiresAt).toLocaleDateString()
          : "N/A",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "licenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -----------------------------------------
     STATUS BADGE
  ----------------------------------------- */
  const statusBadge = (status: string) => {
    const s = status.toUpperCase();

    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      EXPIRED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      GRACE: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[s] || "bg-gray-200 text-gray-700"
        }`}
      >
        {s}
      </span>
    );
  };

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">My Licenses</h1>

      {/* Controls row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search licenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg bg-white shadow-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="GRACE">Grace</option>
          <option value="EXPIRED">Expired</option>
          <option value="PENDING">Pending</option>
        </select>

        {/* Column visibility */}
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

        {/* Export */}
        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow text-gray-500">
          Loading licenses...
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sorted.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          <p className="text-lg font-semibold">No licenses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && sorted.length > 0 && (
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
                {visibleCols.status && (
                  <Th
                    label="Status"
                    active={sortBy === "status"}
                    dir={sortDir}
                    onClick={() => changeSort("status")}
                  />
                )}
                {visibleCols.expires && (
                  <Th
                    label="Expires"
                    active={sortBy === "expires"}
                    dir={sortDir}
                    onClick={() => changeSort("expires")}
                  />
                )}
                {visibleCols.actions && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((lic) => (
                <tr key={lic.licenseKey} className="border-b hover:bg-gray-50">
                  {visibleCols.product && (
                    <td className="px-4 py-2">{lic.productName}</td>
                  )}
                  {visibleCols.licenseKey && (
                    <td className="px-4 py-2 font-mono">{lic.licenseKey}</td>
                  )}
                  {visibleCols.status && (
                    <td className="px-4 py-2">{statusBadge(lic.status)}</td>
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
                      <Link
                        href={`/client/panel/licenses/${lic.licenseKey}`}
                        className="text-blue-600 underline text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && sorted.length > 0 && (
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
