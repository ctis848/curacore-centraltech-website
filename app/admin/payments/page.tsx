"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  id: string;
  client_name?: string | null;
  client_email?: string | null;
  amount: number | string;
  status: string;
  type?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
};

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "annual_fee" | "license_purchase">("all");
  const [sortBy, setSortBy] = useState<"client" | "amount" | "status" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    client: true,
    email: true,
    amount: true,
    status: true,
    type: true,
    date: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Expecting API to return { payments: [...] }
        const res = await fetch("/api/admin/payments", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to load payments");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.payments)
          ? data.payments
          : [];

        setPayments(
          list.map((p: any): Payment => ({
            id: String(p.id),
            client_name: p.client_name ?? p.client?.name ?? null,
            client_email: p.client_email ?? p.client?.email ?? null,
            amount: p.amount,
            status: p.status ?? "unknown",
            type: p.type ?? null,
            created_at: p.created_at ?? p.createdAt ?? null,
            paid_at: p.paid_at ?? p.paidAt ?? null,
          }))
        );
      } catch (e: any) {
        setError(e?.message || "Unable to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return payments.filter((p) => {
      const name = p.client_name?.toLowerCase() || "";
      const email = p.client_email?.toLowerCase() || "";
      const status = p.status?.toLowerCase() || "";
      const type = p.type?.toLowerCase() || "";
      const id = p.id?.toLowerCase() || "";

      const matchesSearch =
        name.includes(q) || email.includes(q) || status.includes(q) || type.includes(q) || id.includes(q);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" || type === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, search, statusFilter, typeFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];

    const getVal = (p: Payment) => {
      switch (sortBy) {
        case "client":
          return (p.client_name || "").toLowerCase();
        case "amount":
          return Number(p.amount) || 0;
        case "status":
          return (p.status || "").toLowerCase();
        case "date":
          return p.paid_at
            ? new Date(p.paid_at).getTime()
            : p.created_at
            ? new Date(p.created_at).getTime()
            : 0;
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

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const base = "px-2 py-1 rounded text-xs font-medium";

    if (s === "paid" || s === "success") {
      return `${base} bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200`;
    }
    if (s === "pending") {
      return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200`;
    }
    if (s === "failed" || s === "error") {
      return `${base} bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200`;
    }
    return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200`;
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Client", "Email", "Amount", "Status", "Type", "Date"],
      ...sorted.map((p) => [
        p.id,
        p.client_name || "",
        p.client_email || "",
        Number(p.amount || 0),
        p.status,
        p.type || "",
        p.paid_at || p.created_at || "",
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Payments</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage all payment transactions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search by client, email, status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="annual_fee">Annual Fee</option>
          <option value="license_purchase">License Purchase</option>
        </select>

        {/* Column toggles */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold dark:text-gray-100">Columns:</span>
          {(
            [
              ["client", "Client"],
              ["email", "Email"],
              ["amount", "Amount"],
              ["status", "Status"],
              ["type", "Type"],
              ["date", "Date"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1 dark:text-gray-100">
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

      {/* Error */}
      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-300">
          No payments found.
        </div>
      )}

      {/* Payments Table */}
      {!loading && sorted.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  {visibleCols.client && (
                    <Th
                      label="Client"
                      active={sortBy === "client"}
                      dir={sortDir}
                      onClick={() => changeSort("client")}
                    />
                  )}
                  {visibleCols.email && <th className="px-4 py-3">Email</th>}
                  {visibleCols.amount && (
                    <Th
                      label="Amount"
                      active={sortBy === "amount"}
                      dir={sortDir}
                      onClick={() => changeSort("amount")}
                    />
                  )}
                  {visibleCols.status && (
                    <Th
                      label="Status"
                      active={sortBy === "status"}
                      dir={sortDir}
                      onClick={() => changeSort("status")}
                    />
                  )}
                  {visibleCols.type && <th className="px-4 py-3">Type</th>}
                  {visibleCols.date && (
                    <Th
                      label="Date"
                      active={sortBy === "date"}
                      dir={sortDir}
                      onClick={() => changeSort("date")}
                    />
                  )}
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {paged.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {visibleCols.client && (
                      <td className="px-4 py-3 dark:text-white">
                        {p.client_name || "—"}
                      </td>
                    )}
                    {visibleCols.email && (
                      <td className="px-4 py-3 dark:text-white">
                        {p.client_email || "—"}
                      </td>
                    )}
                    {visibleCols.amount && (
                      <td className="px-4 py-3 font-semibold dark:text-white">
                        ₦{Number(p.amount || 0).toLocaleString()}
                      </td>
                    )}
                    {visibleCols.status && (
                      <td className="px-4 py-3">
                        <span className={statusBadge(p.status)}>{p.status}</span>
                      </td>
                    )}
                    {visibleCols.type && (
                      <td className="px-4 py-3 dark:text-white">
                        {p.type || "—"}
                      </td>
                    )}
                    {visibleCols.date && (
                      <td className="px-4 py-3 dark:text-white">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleString()
                          : p.created_at
                          ? new Date(p.created_at).toLocaleString()
                          : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="dark:text-gray-200">
              Page {page} of {totalPages} — {sorted.length} payments
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </>
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
      className="px-4 py-3 cursor-pointer select-none hover:text-blue-700 dark:hover:text-blue-300"
      onClick={onClick}
    >
      {label} {active && (dir === "asc" ? "▲" : "▼")}
    </th>
  );
}
