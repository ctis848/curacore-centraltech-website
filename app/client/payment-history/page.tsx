"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

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
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fatalError, setFatalError] = useState("");

  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  // ⭐ FIXED: no dependencies here
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
          console.error("Payment fetch error:", error);
          setFatalError("Unable to load payment history.");
          return;
        }

        const normalized = (data || []).map(normalizePayment);

        setPayments(normalized);
        setFiltered(normalized);
      } catch (err) {
        console.error("Unexpected payment error:", err);
        setFatalError("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []); // ⭐ FIXED

  // Search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = payments.filter((p) => {
      return (
        p.reference.toLowerCase().includes(s) ||
        p.status.toLowerCase().includes(s) ||
        p.gateway.toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, payments]);

  function getSortValue(item: Payment, column: SortColumn) {
    return (item as any)[column] || "";
  }

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

  function exportCSV() {
    const headers = [
      "Payment ID",
      "Amount",
      "Status",
      "Gateway",
      "Reference",
      "Date",
    ];

    const rows = filtered.map((p) => [
      p.id,
      `${p.currency} ${p.amount.toLocaleString()}`,
      p.status,
      p.gateway,
      p.reference,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "payment_history.csv";
    link.click();
  }

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {/* Search + Export */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by reference, status, or gateway..."
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
        <p className="text-slate-500">No payments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border">
            <thead className="bg-slate-900 text-white">
              <tr>
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
                  onClick={() => sortData("gateway")}
                >
                  Gateway {sortArrow("gateway")}
                </th>

                <th className="px-4 py-3 text-left">Reference</th>

                <th
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => sortData("createdAt")}
                >
                  Date {sortArrow("createdAt")}
                </th>

                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
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
      )}

      {/* Modal */}
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
