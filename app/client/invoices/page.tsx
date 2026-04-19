"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Invoice } from "@/types/client";

type SortColumn = "id" | "amount" | "status" | "createdAt";
type SortDirection = "asc" | "desc";

export default function InvoicesPage() {
  const supabase = supabaseBrowser();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selected, setSelected] = useState<Invoice | null>(null);

  // Load invoices
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
          .from("Invoice")
          .select("*")
          .eq("userId", user.id)
          .order("createdAt", { ascending: false });

        if (error) console.error("Invoice fetch error:", error);

        setInvoices((data as Invoice[]) || []);
        setFiltered((data as Invoice[]) || []);
      } catch (err) {
        console.error("Unexpected invoice error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
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
    const headers = ["Invoice ID", "Amount", "Status", "Created At"];

    const rows = filtered.map((inv) => [
      inv.id,
      `₦ ${inv.amount.toLocaleString()}`,
      inv.status,
      inv.createdAt
        ? new Date(inv.createdAt).toLocaleDateString()
        : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "invoices.csv";
    link.click();
  }

  if (loading) {
    return <p className="text-slate-500">Loading invoices…</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">
        Invoices & Payments
      </h1>

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

      {filtered.length === 0 ? (
        <p className="text-slate-500">No invoices found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="rounded-lg border bg-white p-4 shadow-sm flex justify-between"
            >
              <div>
                <p className="font-medium">Invoice #{inv.id}</p>
                <p className="text-sm text-slate-600">
                  Amount: ₦{inv.amount.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">
                  Date:{" "}
                  {inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    inv.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : inv.status === "OVERDUE"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {inv.status}
                </span>

                <button
                  onClick={() => setSelected(inv)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Invoice Details</h2>

            <p><strong>Invoice ID:</strong> {selected.id}</p>
            <p><strong>Amount:</strong> ₦{selected.amount.toLocaleString()}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <p>
              <strong>Date:</strong>{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleDateString()
                : "—"}
            </p>

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
