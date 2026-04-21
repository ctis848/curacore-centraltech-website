"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  annualFeePaidUntil: string | null;
  annualFeePercent: number | null;
  userId: string | null;
  tenantId: string | null;
  status: string;
  createdAt: string;
}

export default function AnnualFeesPage() {
  const supabase = supabaseBrowser();

  const [dueSoon, setDueSoon] = useState<LicenseRow[]>([]);
  const [overdue, setOverdue] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dropdown lists
  const [products, setProducts] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Sorting
  const [sortKey, setSortKey] = useState<"productName" | "licenseKey" | "annualFeePaidUntil" | "status">("productName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Bulk selection
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (rows: LicenseRow[]) => {
    const ids = rows.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // CSV EXPORT
  function exportCSV(rows: LicenseRow[]) {
    if (!rows.length) return;

    const headers = [
      "Product",
      "License Key",
      "Paid Until",
      "Status",
      "Days Remaining",
    ];

    const csvRows = rows.map((lic) => [
      lic.productName || "Unnamed Product",
      lic.licenseKey,
      lic.annualFeePaidUntil || "Never paid",
      lic.status,
      daysRemaining(lic.annualFeePaidUntil),
    ]);

    const csvContent =
      [headers, ...csvRows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `annual-fees-${new Date().toISOString()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // BULK ACTIONS
  async function bulkNotify() {
    if (!selected.length) return alert("No items selected.");

    const res = await fetch("/api/admin/annual-fees/bulk-notify", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    });

    const json = await res.json();
    alert(json.message);
  }

  async function bulkMarkPaid() {
    if (!selected.length) return alert("No items selected.");

    const res = await fetch("/api/admin/annual-fees/bulk-mark-paid", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    });

    const json = await res.json();
    alert(json.message);
    loadFees();
  }

  async function bulkGenerateInvoices() {
    if (!selected.length) return alert("No items selected.");

    const res = await fetch("/api/admin/annual-fees/bulk-generate-invoices", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    });

    const json = await res.json();
    alert(json.message);
  }

  // LOAD FEES
  const loadFees = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("License")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        setErrorMsg("Failed to load annual fees.");
        return;
      }

      const rows = (data as LicenseRow[]) || [];
      const now = new Date();

      // Dropdown lists
      setProducts([...new Set(rows.map((l) => l.productName).filter(Boolean))] as string[]);
      setTenants([...new Set(rows.map((l) => l.tenantId).filter(Boolean))] as string[]);
      setStatuses([...new Set(rows.map((l) => l.status).filter(Boolean))] as string[]);

      // Due soon
      const dueSoonList = rows.filter((lic) => {
        if (!lic.annualFeePaidUntil) return true;
        const paidUntil = new Date(lic.annualFeePaidUntil);
        const diff = paidUntil.getTime() - now.getTime();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
      });

      // Overdue
      const overdueList = rows.filter((lic) => {
        if (!lic.annualFeePaidUntil) return true;
        const paidUntil = new Date(lic.annualFeePaidUntil);
        return paidUntil.getTime() < now.getTime();
      });

      setDueSoon(dueSoonList);
      setOverdue(overdueList);
    } catch {
      setErrorMsg("Unexpected error loading annual fees.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  function daysRemaining(date: string | null) {
    if (!date) return "No payment history";

    const now = new Date();
    const paid = new Date(date);
    const diff = paid.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} days remaining`;
    if (days === 0) return "Expires today";
    return `${Math.abs(days)} days overdue`;
  }

  const filterList = useCallback(
    (list: LicenseRow[]) => {
      const s = search.toLowerCase().trim();

      return list.filter((l) => {
        const matchesProduct = productFilter ? l.productName === productFilter : true;
        const matchesTenant = tenantFilter ? l.tenantId === tenantFilter : true;
        const matchesStatus = statusFilter ? l.status === statusFilter : true;

        const matchesSearch =
          !s ||
          l.productName?.toLowerCase().includes(s) ||
          l.licenseKey.toLowerCase().includes(s) ||
          l.status.toLowerCase().includes(s);

        return matchesProduct && matchesTenant && matchesStatus && matchesSearch;
      });
    },
    [search, productFilter, tenantFilter, statusFilter]
  );

  const sortedList = useCallback(
    (list: LicenseRow[]) => {
      return [...list].sort((a, b) => {
        const A = (a[sortKey] || "").toString().toLowerCase();
        const B = (b[sortKey] || "").toString().toLowerCase();

        if (A < B) return sortDirection === "asc" ? -1 : 1;
        if (A > B) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortKey, sortDirection]
  );

  const combinedList = useMemo(() => {
    const merged = [...dueSoon, ...overdue];
    return sortedList(filterList(merged));
  }, [dueSoon, overdue, filterList, sortedList]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return combinedList.slice(start, start + pageSize);
  }, [combinedList, page]);

  const totalPages = Math.ceil(combinedList.length / pageSize);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Annual Fees</h1>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => exportCSV(combinedList)}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={loadFees}
            className="px-4 py-2 border rounded hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selected.length > 0 && (
        <div className="mb-4 p-3 bg-slate-100 border rounded flex items-center gap-4">
          <span className="font-medium">{selected.length} selected</span>

          <button
            onClick={() => exportCSV(combinedList.filter((x) => selected.includes(x.id)))}
            className="px-3 py-1 bg-teal-600 text-white rounded text-sm"
          >
            Export CSV
          </button>

          <button
            onClick={bulkNotify}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Notify Tenants
          </button>

          <button
            onClick={bulkMarkPaid}
            className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
          >
            Mark Paid
          </button>

          <button
            onClick={bulkGenerateInvoices}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
          >
            Generate Invoices
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search product, key, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded flex-1 min-w-[200px]"
        />

        <select className="border px-3 py-2 rounded" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="">All Products</option>
          {products.map((p) => <option key={p}>{p}</option>)}
        </select>

        <select className="border px-3 py-2 rounded" value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
          <option value="">All Tenants</option>
          {tenants.map((t) => <option key={t}>{t}</option>)}
        </select>

        <select className="border px-3 py-2 rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b text-slate-700">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  onChange={() => toggleSelectAll(paginated)}
                  checked={paginated.every((x) => selected.includes(x.id))}
                />
              </th>

              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => setSortKey("productName")}
              >
                Product {sortKey === "productName" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => setSortKey("licenseKey")}
              >
                License Key {sortKey === "licenseKey" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => setSortKey("annualFeePaidUntil")}
              >
                Paid Until {sortKey === "annualFeePaidUntil" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => setSortKey("status")}
              >
                Status {sortKey === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th className="p-3 text-left">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading annual fees…
                </td>
              </tr>
            )}

            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No results found.
                </td>
              </tr>
            )}

            {!loading &&
              paginated.map((lic, index) => (
                <tr
                  key={`${lic.id}-${index}`}
                  className="border-b hover:bg-slate-50 transition-colors even:bg-slate-50/30"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(lic.id)}
                      onChange={() => toggleSelect(lic.id)}
                    />
                  </td>

                  <td className="p-3 font-medium">{lic.productName || "Unnamed Product"}</td>

                  <td className="p-3 font-mono text-xs text-slate-700 break-all">
                    {lic.licenseKey}
                  </td>

                  <td className="p-3">
                    {lic.annualFeePaidUntil || (
                      <span className="text-slate-500 italic">Never paid</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        daysRemaining(lic.annualFeePaidUntil).includes("overdue")
                          ? "bg-red-100 text-red-700"
                          : daysRemaining(lic.annualFeePaidUntil).includes("remaining")
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {daysRemaining(lic.annualFeePaidUntil)}
                    </span>
                  </td>

                  <td className="p-3">
                    <a
                      href={`/admin/annual-fees/${lic.id}`}
                      className="text-teal-600 hover:underline font-medium"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 border rounded ${
              page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"
            }`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded ${
                  p === page ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 border rounded ${
              page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
