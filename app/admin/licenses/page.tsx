"use client";

import { useEffect, useMemo, useState } from "react";

type LicenseRow = {
  id: string;
  license_key: string;
  status: string;
  activated_at: string | null;
  expires_at: string | null;
  product_name?: string | null;
  clients?: {
    email: string | null;
    name: string | null;
  }[] | null;
};

export default function LicensesListPage() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"client" | "email" | "status" | "activated" | "expires">(
    "activated"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const [visibleCols, setVisibleCols] = useState({
    client: true,
    email: true,
    license_key: true,
    status: true,
    activated: true,
    expires: true,
    actions: true,
  });

  // Fetch licenses
  useEffect(() => {
    fetch("/api/admin/licenses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLicenses(Array.isArray(d.licenses) ? d.licenses : []));
  }, []);

  // SEARCH + FILTER
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return licenses.filter((l) => {
      const client = l.clients?.[0]?.name?.toLowerCase() || "";
      const email = l.clients?.[0]?.email?.toLowerCase() || "";
      const key = l.license_key?.toLowerCase() || "";
      const status = l.status?.toLowerCase() || "";

      const matchesSearch =
        client.includes(q) || email.includes(q) || key.includes(q) || status.includes(q);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [licenses, search, statusFilter]);

  // SORTING
  const sorted = useMemo(() => {
    const copy = [...filtered];

    const getVal = (l: LicenseRow) => {
      switch (sortBy) {
        case "client":
          return l.clients?.[0]?.name?.toLowerCase() || "";
        case "email":
          return l.clients?.[0]?.email?.toLowerCase() || "";
        case "status":
          return l.status?.toLowerCase() || "";
        case "activated":
          return l.activated_at ? new Date(l.activated_at).getTime() : 0;
        case "expires":
          return l.expires_at ? new Date(l.expires_at).getTime() : 0;
        default:
          return "";
      }
    };

    copy.sort((a, b) => {
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

  const badge = (status: string) => {
    const s = status.toLowerCase();
    const base = "px-2 py-1 rounded text-xs font-semibold";

    switch (s) {
      case "active":
        return `${base} bg-green-100 text-green-700`;
      case "expired":
        return `${base} bg-red-100 text-red-700`;
      case "revoked":
        return `${base} bg-gray-300 text-gray-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Client", "Email", "License Key", "Status", "Activated", "Expires"],
      ...sorted.map((l) => [
        l.clients?.[0]?.name || "",
        l.clients?.[0]?.email || "",
        l.license_key,
        l.status,
        l.activated_at ? new Date(l.activated_at).toLocaleString() : "",
        l.expires_at ? new Date(l.expires_at).toLocaleString() : "",
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "licenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-700">All Licenses</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search licenses..."
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
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>

        {/* Column toggles */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold">Columns:</span>
          {(
            [
              ["client", "Client"],
              ["email", "Email"],
              ["license_key", "License Key"],
              ["status", "Status"],
              ["activated", "Activated"],
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

      {/* Empty State */}
      {sorted.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          <p className="text-lg font-semibold">No licenses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Table */}
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
                {visibleCols.email && (
                  <Th
                    label="Email"
                    active={sortBy === "email"}
                    dir={sortDir}
                    onClick={() => changeSort("email")}
                  />
                )}
                {visibleCols.license_key && <th className="p-2 text-left">License Key</th>}
                {visibleCols.status && (
                  <Th
                    label="Status"
                    active={sortBy === "status"}
                    dir={sortDir}
                    onClick={() => changeSort("status")}
                  />
                )}
                {visibleCols.activated && (
                  <Th
                    label="Activated"
                    active={sortBy === "activated"}
                    dir={sortDir}
                    onClick={() => changeSort("activated")}
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
                {visibleCols.actions && <th className="p-2 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {paged.map((l) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  {visibleCols.client && (
                    <td className="p-2">{l.clients?.[0]?.name ?? "—"}</td>
                  )}
                  {visibleCols.email && (
                    <td className="p-2">{l.clients?.[0]?.email ?? "—"}</td>
                  )}
                  {visibleCols.license_key && (
                    <td className="p-2 font-mono text-xs">
                      {l.license_key}
                      <button
                        onClick={() => navigator.clipboard.writeText(l.license_key)}
                        className="ml-2 text-teal-600 hover:underline"
                      >
                        Copy
                      </button>
                    </td>
                  )}
                  {visibleCols.status && (
                    <td className="p-2">
                      <span className={badge(l.status)}>{l.status}</span>
                    </td>
                  )}
                  {visibleCols.activated && (
                    <td className="p-2">
                      {l.activated_at ? new Date(l.activated_at).toLocaleString() : "—"}
                    </td>
                  )}
                  {visibleCols.expires && (
                    <td className="p-2">
                      {l.expires_at ? new Date(l.expires_at).toLocaleString() : "—"}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td className="p-2">
                      <a
                        href={`/admin/licenses/${l.id}`}
                        className="px-3 py-1 bg-teal-600 text-white rounded text-xs"
                      >
                        View
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
