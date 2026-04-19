"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

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

type SortColumn = "invoiceNumber" | "amount" | "status" | "createdAt";
type SortDirection = "asc" | "desc";

export default function InvoiceHistoryPage() {
  const supabase = supabaseBrowser();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selected, setSelected] = useState<Invoice | null>(null);

  // Normalize DB → UI (camelCase only)
  function normalizeInvoice(row: any): Invoice {
    return {
      id: row.id,
      userId: row.userId,
      licenseId: row.licenseId,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      description: row.description,
    };
  }

  // Load invoices
  useEffect(() => {
    async function loadInvoices() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setInvoices([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) console.error("Invoice fetch error:", error);

      const normalized = (data || []).map(normalizeInvoice);

      setInvoices(normalized);
      setFiltered(normalized);
      setLoading(false);
    }

    loadInvoices();
  }, [supabase]);

  // Search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = invoices.filter((inv) => {
      return (
        inv.id.toLowerCase().includes(s) ||
        inv.status.toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, invoices]);

  // Sorting helper
  function getSortValue(item: Invoice, column: SortColumn) {
    return (item as any)[column] || "";
  }

  // Sorting
  function sortData(column: SortColumn) {
    let direction: SortDirection = "asc";

    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
    }

    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...filtered].sort((a, b) => {
      const valA = getSortValue(a, column).toString().toLowerCase();
      const valB = getSortValue(b, column).toString().toLowerCase();

      if (direction === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    setFiltered(sorted);
  }

  const sortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Export CSV
  function exportCSV() {
    const headers = [
      "Invoice ID",
      "Amount",
      "Status",
      "Created At",
      "Paid At",
      "Description",
    ];

    const rows = filtered.map((inv) => [
      inv.id,
      `${inv.currency} ${inv.amount.toLocaleString()}`,
      inv.status,
      new Date(inv.createdAt).toLocaleString(),
      inv.paidAt ? new Date(inv.paidAt).toLocaleString() : "",
      inv.description || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "invoice_history.csv";
    link.click();
  }

  if (loading) return <p className="p-4">Loading invoice history...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoice History</h1>

      {/* Search + Export */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by invoice ID or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded shadow-sm"
        />

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("invoiceNumber")}
              >
                Invoice ID {sortArrow("invoiceNumber")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("amount")}
              >
                Amount {sortArrow("amount")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("status")}
              >
                Status {sortArrow("status")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("createdAt")}
              >
                Created {sortArrow("createdAt")}
              </th>

              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-slate-100">
                <td className="px-4 py-3 font-mono">{inv.id}</td>

                <td className="px-4 py-3">
                  {inv.currency} {inv.amount.toLocaleString()}
                </td>

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

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Invoice Details</h2>

            <p><strong>Invoice ID:</strong> {selected.id}</p>
            <p><strong>Amount:</strong> {selected.currency} {selected.amount.toLocaleString()}</p>
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
