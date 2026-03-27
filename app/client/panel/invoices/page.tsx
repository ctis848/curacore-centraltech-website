"use client";

import { useEffect, useMemo, useState } from "react";

type Invoice = {
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
};

const PAGE_SIZE = 20;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"invoice" | "amount" | "status" | "due">("invoice");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    invoiceId: true,
    amount: true,
    status: true,
    issuedAt: true,
    dueAt: true,
    actions: true,
  });

  useEffect(() => {
    fetch("/api/client/invoices", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setInvoices(d.invoices || []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceId.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      switch (sortBy) {
        case "invoice":
          av = a.invoiceId.toLowerCase();
          bv = b.invoiceId.toLowerCase();
          break;
        case "amount":
          av = a.amount;
          bv = b.amount;
          break;
        case "status":
          av = a.status.toLowerCase();
          bv = b.status.toLowerCase();
          break;
        case "due":
          av = new Date(a.dueAt).getTime();
          bv = new Date(b.dueAt).getTime();
          break;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

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
      ["Invoice ID", "Amount", "Status", "Issued", "Due"],
      ...sorted.map((inv) => [
        inv.invoiceId,
        `${inv.currency} ${inv.amount}`,
        inv.status,
        new Date(inv.issuedAt).toLocaleDateString(),
        new Date(inv.dueAt).toLocaleDateString(),
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        {/* Column toggles */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold mr-1">Columns:</span>
          {(
            [
              ["invoiceId", "Invoice ID"],
              ["amount", "Amount"],
              ["status", "Status"],
              ["issuedAt", "Issued"],
              ["dueAt", "Due"],
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

      {/* Table */}
      {sorted.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                {visibleCols.invoiceId && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("invoice")}
                  >
                    Invoice ID {sortBy === "invoice" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.amount && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("amount")}
                  >
                    Amount {sortBy === "amount" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.status && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("status")}
                  >
                    Status {sortBy === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.issuedAt && (
                  <th className="px-4 py-2 text-left">Issued</th>
                )}
                {visibleCols.dueAt && (
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => changeSort("due")}
                  >
                    Due {sortBy === "due" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                )}
                {visibleCols.actions && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paged.map((inv) => (
                <tr key={inv.invoiceId} className="border-b hover:bg-gray-50">
                  {visibleCols.invoiceId && (
                    <td className="px-4 py-2">{inv.invoiceId}</td>
                  )}
                  {visibleCols.amount && (
                    <td className="px-4 py-2">
                      {inv.currency} {inv.amount}
                    </td>
                  )}
                  {visibleCols.status && (
                    <td className="px-4 py-2">{inv.status}</td>
                  )}
                  {visibleCols.issuedAt && (
                    <td className="px-4 py-2">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                  )}
                  {visibleCols.dueAt && (
                    <td className="px-4 py-2">
                      {new Date(inv.dueAt).toLocaleDateString()}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td className="px-4 py-2">
                      <a
                        href={`/client/panel/invoices/${inv.invoiceId}`}
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
            Page {page} of {totalPages} — {sorted.length} invoices
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
