"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  licenseId: string | null;
  user?: { email: string };
  tenantId?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

type SortKey = "amount" | "currency" | "status" | "createdAt" | "paidAt";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [tenantFilter, setTenantFilter] = useState("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Invoice | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/billing").then((r) => r.json()),
      fetch("/admin/api/tenants").then((r) => r.json()),
    ])
      .then(([invoiceData, tenantData]) => {
        setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
        setTenants(Array.isArray(tenantData) ? tenantData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (inv) =>
          inv.user?.email.toLowerCase().includes(q) ||
          inv.licenseId?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((inv) => inv.status === statusFilter);
    }

    if (currencyFilter !== "ALL") {
      data = data.filter((inv) => inv.currency === currencyFilter);
    }

    if (tenantFilter !== "ALL") {
      data = data.filter((inv) => inv.tenantId === tenantFilter);
    }

    data.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (sortKey === "createdAt" || sortKey === "paidAt") {
        const aDate = aVal ? new Date(aVal).getTime() : 0;
        const bDate = bVal ? new Date(bVal).getTime() : 0;
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (sortKey === "amount") {
        return sortDir === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [invoices, search, statusFilter, currencyFilter, tenantFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageData = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async (inv: Invoice) => {
    try {
      await fetch(`/admin/api/billing/${inv.id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      setConfirmDelete(null);
    } catch {}
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading invoices...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Billing</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by user or license..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => {
              setCurrencyFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All currencies</option>
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="EUR">EUR</option>
          </select>

          <select
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="ALL">All tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
          {pageData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No invoices found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("amount")}>
                    Amount
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("currency")}>
                    Currency
                  </th>
                  <th className="p-3">User</th>
                  <th className="p-3">License</th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("status")}>
                    Status
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                    Created
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("paidAt")}>
                    Paid At
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">${inv.amount.toFixed(2)}</td>
                    <td className="p-3">{inv.currency}</td>
                    <td className="p-3">{inv.user?.email ?? "—"}</td>
                    <td className="p-3">{inv.licenseId ?? "—"}</td>
                    <td className="p-3">{inv.status}</td>
                    <td className="p-3">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {inv.paidAt
                        ? new Date(inv.paidAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button className="text-green-600 dark:text-green-400">
                        Refund
                      </button>
                      <button
                        onClick={() => setConfirmDelete(inv)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-white"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* View Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Invoice Details
              </h2>

              <p className="dark:text-white">
                <strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}
              </p>
              <p className="dark:text-white">
                <strong>Currency:</strong> {selectedInvoice.currency}
              </p>
              <p className="dark:text-white">
                <strong>User:</strong> {selectedInvoice.user?.email ?? "—"}
              </p>
              <p className="dark:text-white">
                <strong>License:</strong> {selectedInvoice.licenseId ?? "—"}
              </p>
              <p className="dark:text-white">
                <strong>Status:</strong> {selectedInvoice.status}
              </p>
              <p className="dark:text-white">
                <strong>Created:</strong>{" "}
                {new Date(selectedInvoice.createdAt).toLocaleString()}
              </p>
              <p className="dark:text-white">
                <strong>Paid At:</strong>{" "}
                {selectedInvoice.paidAt
                  ? new Date(selectedInvoice.paidAt).toLocaleString()
                  : "—"}
              </p>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Delete Invoice
              </h2>
              <p className="dark:text-white">
                Are you sure you want to delete invoice{" "}
                <strong>{confirmDelete.id}</strong>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
