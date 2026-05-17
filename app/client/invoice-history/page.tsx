"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Invoice {
  id: string;
  userId: string;
  licenseId: string | null;
  amount: number;
  currency: string;
  status: "PAID" | "UNPAID" | "OVERDUE" | "PENDING";
  createdAt: string;
  paidAt: string | null;
  description: string | null;
}

export default function InvoiceHistoryPage() {
  const supabase = supabaseBrowser();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<keyof Invoice>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (!error) {
      setInvoices(data as Invoice[]);
    }

    setLoading(false);
  }

  function handleSort(field: keyof Invoice) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: keyof Invoice) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function applyDateFilter(created: string) {
    if (!created) return false;
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
    let rows = [...invoices];

    const s = search.toLowerCase();

    rows = rows.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(s) ||
        inv.status.toLowerCase().includes(s) ||
        (inv.description ?? "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" || inv.status === statusFilter;

      const matchesCurrency =
        currencyFilter === "ALL" || inv.currency === currencyFilter;

      const matchesMin =
        minAmount === "" || inv.amount >= Number(minAmount);

      const matchesMax =
        maxAmount === "" || inv.amount <= Number(maxAmount);

      const matchesDate = applyDateFilter(inv.createdAt);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCurrency &&
        matchesMin &&
        matchesMax &&
        matchesDate
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
    invoices,
    search,
    statusFilter,
    currencyFilter,
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

  function exportCSV() {
    const headers = [
      "Invoice ID",
      "Amount",
      "Currency",
      "Status",
      "Created",
      "Paid",
      "Description",
    ];

    const rows = processed.map((inv) => [
      inv.id,
      inv.amount,
      inv.currency,
      inv.status,
      inv.createdAt,
      inv.paidAt ?? "",
      inv.description ?? "",
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice_history.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((inv) => ({
        InvoiceID: inv.id,
        Amount: inv.amount,
        Currency: inv.currency,
        Status: inv.status,
        Created: inv.createdAt,
        Paid: inv.paidAt,
        Description: inv.description,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "invoice_history.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Invoice History", 14, 10);

    autoTable(doc, {
      head: [["Invoice ID", "Amount", "Currency", "Status", "Created"]],
      body: processed.map((inv) => [
        inv.id,
        String(inv.amount),
        inv.currency,
        inv.status,
        inv.createdAt,
      ]),
    });

    doc.save("invoice_history.pdf");
  }

  const uniqueCurrencies = Array.from(
    new Set(invoices.map((i) => i.currency))
  );

  const uniqueStatuses = Array.from(
    new Set(invoices.map((i) => i.status))
  );

  if (loading) return <p className="p-4">Loading invoice history...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Invoice History</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by ID, status, or description..."
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
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
        >
          <option value="ALL">All Currencies</option>
          {uniqueCurrencies.map((c) => (
            <option key={c} value={c}>
              {c}
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
                onClick={() => handleSort("id")}
              >
                Invoice ID{getSortIcon("id")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount{getSortIcon("amount")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("currency")}
              >
                Currency{getSortIcon("currency")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{getSortIcon("status")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created{getSortIcon("createdAt")}
              </th>

              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((inv) => (
              <tr
                key={inv.id}
                className={`border-b hover:bg-slate-100 ${
                  inv.status === "PAID"
                    ? "bg-green-50"
                    : inv.status === "OVERDUE"
                    ? "bg-red-50"
                    : inv.status === "PENDING"
                    ? "bg-yellow-50"
                    : ""
                }`}
              >
                <td className="px-4 py-3 font-mono">{inv.id}</td>

                <td className="px-4 py-3">
                  {inv.amount.toLocaleString()}
                </td>

                <td className="px-4 py-3">{inv.currency}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      inv.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "OVERDUE"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(inv)}
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
            <h2 className="text-xl font-bold mb-4">Invoice Details</h2>

            <p><strong>Invoice ID:</strong> {selected.id}</p>
            <p><strong>Amount:</strong> {selected.amount.toLocaleString()}</p>
            <p><strong>Currency:</strong> {selected.currency}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <p><strong>Created:</strong> {new Date(selected.createdAt).toLocaleDateString()}</p>
            <p><strong>Paid:</strong> {selected.paidAt ? new Date(selected.paidAt).toLocaleDateString() : "Not Paid"}</p>
            <p><strong>Description:</strong> {selected.description || "—"}</p>

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
