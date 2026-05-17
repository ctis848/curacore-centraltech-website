"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  gateway: string;
  createdAt: string;
}

type SortColumn = "amount" | "status" | "createdAt" | "gateway";
type SortDirection = "asc" | "desc";

export default function PaymentHistoryPage() {
  const supabase = supabaseBrowser();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<SortColumn>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Payment | null>(null);

  function normalizePayment(row: any): Payment {
    return {
      id: row.id,
      userId: row.userid,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      reference: row.reference,
      gateway: row.gateway,
      createdAt: row.created_at,
    };
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;
        if (!user) {
          setFatalError("You must be logged in.");
          return;
        }

        const { data, error } = await supabase
          .from("Payment")
          .select(`
            id,
            userid,
            amount,
            currency,
            status,
            reference,
            gateway,
            created_at
          `)
          .eq("userid", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          setFatalError("Unable to load payment history.");
          return;
        }

        const normalized = (data || []).map(normalizePayment);
        setPayments(normalized);
      } catch {
        setFatalError("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function applyDateFilter(created: string) {
    const createdDate = new Date(created).getTime();
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (createdDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      if (createdDate > to) return false;
    }
    return true;
  }

  function setPresetDays(days: number) {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(now.toISOString().slice(0, 10));
  }

  function setPresetThisYear() {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }

  const processed = useMemo(() => {
    let list = [...payments];

    const s = search.toLowerCase();

    list = list.filter((p) => {
      const matchesSearch =
        p.reference.toLowerCase().includes(s) ||
        p.status.toLowerCase().includes(s) ||
        p.gateway.toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      const matchesGateway =
        gatewayFilter === "ALL" || p.gateway === gatewayFilter;

      const matchesMin =
        minAmount === "" || p.amount >= Number(minAmount);

      const matchesMax =
        maxAmount === "" || p.amount <= Number(maxAmount);

      const matchesDate = applyDateFilter(p.createdAt);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGateway &&
        matchesMin &&
        matchesMax &&
        matchesDate
      );
    });

    list.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    payments,
    search,
    statusFilter,
    gatewayFilter,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function sortArrow(column: SortColumn) {
    if (sortField !== column) return "↕️";
    return sortDir === "asc" ? "↑" : "↓";
  }

  function handleSort(column: SortColumn) {
    if (sortField === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(column);
      setSortDir("asc");
    }
  }

  function exportCSV() {
    const headers = [
      "Payment ID",
      "Amount",
      "Status",
      "Gateway",
      "Reference",
      "Date",
    ];

    const rows = processed.map((p) => [
      p.id,
      `${p.currency} ${p.amount.toLocaleString()}`,
      p.status,
      p.gateway,
      p.reference,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payment_history.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((p) => ({
        PaymentID: p.id,
        Amount: p.amount,
        Currency: p.currency,
        Status: p.status,
        Gateway: p.gateway,
        Reference: p.reference,
        Date: p.createdAt,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payment_history.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Payment History", 14, 10);

    autoTable(doc, {
      head: [["ID", "Amount", "Status", "Gateway", "Reference", "Date"]],
      body: processed.map((p) => [
        p.id,
        `${p.currency} ${p.amount}`,
        p.status,
        p.gateway,
        p.reference,
        p.createdAt,
      ]),
    });

    doc.save("payment_history.pdf");
  }

  const uniqueStatuses = Array.from(
    new Set(payments.map((p) => p.status))
  );

  const uniqueGateways = Array.from(
    new Set(payments.map((p) => p.gateway))
  );

  if (fatalError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payment History</h1>
        <p className="text-red-600">{fatalError}</p>
      </div>
    );
  }

  if (loading) {
    return <p className="p-6 text-slate-500">Loading payments…</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by reference, status, or gateway..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded shadow-sm min-w-[200px]"
        />

        <select
          className="px-3 py-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded"
          value={gatewayFilter}
          onChange={(e) => setGatewayFilter(e.target.value)}
        >
          <option value="ALL">All Gateways</option>
          {uniqueGateways.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="px-3 py-2 border rounded w-32"
        />

        <input
          type="number"
          placeholder="Max Amount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="px-3 py-2 border rounded w-32"
        />
      </div>

      {/* DATE FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>

        <button
          onClick={() => setPresetDays(7)}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPresetDays(30)}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          Last 30 Days
        </button>
        <button
          onClick={setPresetThisYear}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          This Year
        </button>
        <button
          onClick={() => {
            setDateFrom("");
            setDateTo("");
          }}
          className="px-3 py-1 text-xs bg-slate-100 rounded"
        >
          Clear Dates
        </button>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-700 text-white rounded"
        >
          Export CSV
        </button>
        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Export PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount {sortArrow("amount")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {sortArrow("status")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("gateway")}
              >
                Gateway {sortArrow("gateway")}
              </th>

              <th className="px-4 py-3 text-left">Reference</th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Date {sortArrow("createdAt")}
              </th>

              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-100">
                <td className="px-4 py-3">
                  {p.currency} {p.amount.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      p.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : p.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : p.status === "REFUNDED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="px-4 py-3">{p.gateway}</td>

                <td className="px-4 py-3 font-mono">{p.reference}</td>

                <td className="px-4 py-3">
                  {new Date(p.createdAt).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(p)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>

            <p><strong>Payment ID:</strong> {selected.id}</p>
            <p><strong>Amount:</strong> {selected.currency} {selected.amount.toLocaleString()}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <p><strong>Gateway:</strong> {selected.gateway}</p>
            <p><strong>Reference:</strong> {selected.reference}</p>
            <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
