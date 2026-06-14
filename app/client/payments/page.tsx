"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentList from "@/components/client/payments/list";
import PaymentModal from "@/components/client/payments/modal";
import EmptyState from "@/components/client/payments/empty";

export type ClientPayment = {
  id: string;
  clientId: string;
  amount: number;
  currency: string | null;
  status: string | null;
  reference: string | null;
  gateway: string | null;
  channel: string | null;
  created_at: string | null;
};

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [sortField, setSortField] =
    useState<keyof ClientPayment>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<ClientPayment | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    const res = await fetch("/api/client/payments");
    const json = await res.json();
    if (json.success) setPayments(json.data);
    setLoading(false);
  }

  function applyDateFilter(created: string | null) {
    if (!created) return false;
    const createdDate = new Date(created).getTime();
    if (dateFrom && createdDate < new Date(dateFrom).getTime()) return false;
    if (dateTo && createdDate > new Date(dateTo).getTime()) return false;
    return true;
  }

  function applyAmountFilter(amount: number) {
    if (minAmount && amount < Number(minAmount)) return false;
    if (maxAmount && amount > Number(maxAmount)) return false;
    return true;
  }

  const processed = useMemo(() => {
    let rows = [...payments];
    const s = search.toLowerCase();

    rows = rows.filter((p) => {
      const matchesSearch =
        (p.reference ?? "").toLowerCase().includes(s) ||
        (p.status ?? "").toLowerCase().includes(s) ||
        (p.gateway ?? "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" ||
        (p.status ?? "").toLowerCase() === statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        applyDateFilter(p.created_at) &&
        applyAmountFilter(p.amount)
      );
    });

    rows.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    payments,
    search,
    statusFilter,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  const uniqueStatuses = Array.from(
    new Set(payments.map((p) => p.status).filter(Boolean))
  ) as string[];

  function totalAmount() {
    return processed.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }

  function handleSort(field: keyof ClientPayment) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: keyof ClientPayment) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        My Payments
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl shadow-md bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <p className="text-sm opacity-80">Total Records</p>
          <p className="text-3xl font-bold">{processed.length}</p>
        </div>

        <div className="p-5 rounded-xl shadow-md bg-gradient-to-br from-green-500 to-emerald-700 text-white">
          <p className="text-sm opacity-80">Total Amount</p>
          <p className="text-3xl font-bold">
            ₦{totalAmount().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-6">

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search by reference, status, or gateway..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div>
            <label className="text-xs font-semibold text-slate-600">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Min Amount</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Max Amount</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
          >
            <option value="ALL">All Status</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading && <p className="text-slate-500">Loading payments…</p>}

      {!loading && processed.length === 0 && <EmptyState />}

      {!loading && processed.length > 0 && (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("created_at")}
                >
                  Date{getSortIcon("created_at")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("amount")}
                >
                  Amount{getSortIcon("amount")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    ₦{Number(p.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono break-all">{p.reference}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (p.status || "").toLowerCase() === "success"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {processed.length > pageSize && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <PaymentModal payment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
