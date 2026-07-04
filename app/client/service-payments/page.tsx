"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentModal from "@/components/client/payments/modal";
import EmptyState from "@/components/client/payments/empty";

export default function ServicePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const res = await fetch("/api/client/service-payments");
    const json = await res.json();

    if (json.success) {
      setPayments(json.data);
    }

    setLoading(false);
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return payments.filter((p) => {
      const matchesSearch =
        (p.reference ?? "").toLowerCase().includes(s) ||
        (p.status ?? "").toLowerCase().includes(s) ||
        (p.purpose ?? "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" ||
        (p.status ?? "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Service Payments
      </h1>

      {/* Filters */}
      <div className="p-6 bg-white rounded-xl shadow-md border space-y-4">
        <input
          type="text"
          placeholder="Search by reference, status, or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg shadow-sm"
        >
          <option value="ALL">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      {loading && <p className="text-slate-500">Loading service payments…</p>}
      {!loading && filtered.length === 0 && <EmptyState />}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-200 to-purple-200 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {new Date(p.created_at).toLocaleString()}
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

      <PaymentModal payment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
