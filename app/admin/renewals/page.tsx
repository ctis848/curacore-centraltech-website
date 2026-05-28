"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Toast from "@/components/Toast";

interface CompanyRow {
  id: string;
  name: string;
  annual_price: number;
  renewal_date: string | null;
  license_count: number;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RenewalsPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);

  // ⭐ Collapsible sections
  const [open3, setOpen3] = useState(true);   // open by default
  const [open7, setOpen7] = useState(false);
  const [open30, setOpen30] = useState(false);

  // ⭐ Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showSuccess = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ⭐ Renewal Logic
  const renewalState = (renewal_date: string | null) => {
    if (!renewal_date) return "Unknown";

    const now = new Date();
    const exp = new Date(renewal_date);
    const diff = exp.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 3 && days >= 0) return "Due in 3 days";
    if (days <= 7 && days > 3) return "Due in 7 days";
    if (days <= 30 && days > 7) return "Due in 30 days";

    return "Not in range";
  };

  const rowColorClass = (renewal_date: string | null) => {
    const state = renewalState(renewal_date);
    if (state.includes("3 days")) return "bg-red-50";
    if (state.includes("7 days")) return "bg-orange-50";
    if (state.includes("30 days")) return "bg-yellow-50";
    return "";
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (rows: CompanyRow[]) => {
    const ids = rows.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const exportCSV = (rows: CompanyRow[]) => {
    if (!rows.length) return;

    const headers = [
      "Company",
      "Annual Price",
      "Renewal Date",
      "License Count",
      "Renewal State",
    ];

    const csvRows = rows.map((c) => [
      c.name,
      c.annual_price,
      c.renewal_date || "Unknown",
      c.license_count,
      renewalState(c.renewal_date),
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
    link.download = `renewals-${new Date().toISOString()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // ⭐ Auto-email reminder
  const sendReminder = async (id: string) => {
    const res = await fetch("/api/admin/renewals/notify-company", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    showSuccess(json.message || "Reminder sent successfully");
  };

  const bulkNotify = async (rows: CompanyRow[]) => {
    const ids = rows.map((r) => r.id);
    if (!ids.length) return showSuccess("No companies selected");

    const res = await fetch("/api/admin/renewals/bulk-notify-company", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });

    const json = await res.json();
    showSuccess(json.message || "Bulk reminders sent");
  };

  // ⭐ Load companies
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (debouncedSearch) params.set("search", debouncedSearch);

    const res = await fetch(`/api/admin/renewals?${params.toString()}`);
    const json = await res.json();

    if (!json.success) {
      setErrorMsg(json.message || "Failed to load renewals.");
      setLoading(false);
      return;
    }

    setCompanies(json.data || []);
    setTotalCount(json.total || 0);
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // ⭐ Filter into 3 categories
  const due3 = companies.filter((c) => renewalState(c.renewal_date).includes("3 days"));
  const due7 = companies.filter((c) => renewalState(c.renewal_date).includes("7 days"));
  const due30 = companies.filter((c) => renewalState(c.renewal_date).includes("30 days"));

  // ⭐ Reusable table component
  const renderTable = (rows: CompanyRow[]) => (
    <table className="w-full text-sm">
      <thead className="bg-slate-100 sticky top-0 z-10">
        <tr className="border-b text-slate-700">
          <th className="p-4 text-left">
            <input
              type="checkbox"
              onChange={() => toggleSelectAll(rows)}
              checked={rows.length > 0 && rows.every((x) => selected.includes(x.id))}
            />
          </th>
          <th className="p-4 text-left font-semibold">Company</th>
          <th className="p-4 text-left font-semibold">Annual Price</th>
          <th className="p-4 text-left font-semibold">Renewal Date</th>
          <th className="p-4 text-left font-semibold">Licenses</th>
          <th className="p-4 text-left font-semibold">Status</th>
          <th className="p-4 text-left font-semibold">Actions</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((c) => (
          <tr
            key={c.id}
            className={`border-b hover:bg-slate-50 transition ${rowColorClass(c.renewal_date)}`}
          >
            <td className="p-4">
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggleSelect(c.id)}
              />
            </td>

            <td className="p-4 font-medium">{c.name}</td>

            <td className="p-4">₦{Number(c.annual_price).toLocaleString()}</td>

            <td className="p-4">
              {c.renewal_date
                ? new Date(c.renewal_date).toLocaleDateString()
                : "Unknown"}
            </td>

            <td className="p-4">{c.license_count}</td>

            <td className="p-4">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  renewalState(c.renewal_date).includes("3 days")
                    ? "bg-red-100 text-red-700"
                    : renewalState(c.renewal_date).includes("7 days")
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {renewalState(c.renewal_date)}
              </span>
            </td>

            <td className="p-4 flex items-center gap-3">
              <button
                onClick={() => sendReminder(c.id)}
                className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
              >
                Remind
              </button>

              <a
                href={`/admin/renewals/${c.id}`}
                className="text-teal-600 hover:text-teal-800 font-semibold text-xs"
              >
                View
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renewals
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by company name..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="px-4 py-3 border rounded-lg shadow-sm w-full max-w-md focus:ring-2 focus:ring-purple-400"
      />

      {/* 🔴 SECTION — 3 DAYS */}
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200">
        <button
          onClick={() => setOpen3(!open3)}
          className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-red-700"
        >
          <span>🔴 Due in 3 Days ({due3.length})</span>
          <span>{open3 ? "▲" : "▼"}</span>
        </button>

        {open3 && (
          <div className="p-4">
            {renderTable(due3)}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => bulkNotify(due3)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
              >
                Send Bulk Reminders
              </button>

              <button
                onClick={() => exportCSV(due3)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg shadow hover:bg-slate-800"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🟠 SECTION — 7 DAYS */}
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200">
        <button
          onClick={() => setOpen7(!open7)}
          className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-orange-700"
        >
          <span>🟠 Due in 7 Days ({due7.length})</span>
          <span>{open7 ? "▲" : "▼"}</span>
        </button>

        {open7 && (
          <div className="p-4">
            {renderTable(due7)}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => bulkNotify(due7)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700"
              >
                Send Bulk Reminders
              </button>

              <button
                onClick={() => exportCSV(due7)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg shadow hover:bg-slate-800"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🟡 SECTION — 30 DAYS */}
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200">
        <button
          onClick={() => setOpen30(!open30)}
          className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-yellow-700"
        >
          <span>🟡 Due in 30 Days ({due30.length})</span>
          <span>{open30 ? "▲" : "▼"}</span>
        </button>

        {open30 && (
          <div className="p-4">
            {renderTable(due30)}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => bulkNotify(due30)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700"
              >
                Send Bulk Reminders
              </button>

              <button
                onClick={() => exportCSV(due30)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg shadow hover:bg-slate-800"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 border rounded-lg ${
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
                className={`px-3 py-1 border rounded-lg ${
                  p === page ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-4 py-2 border rounded-lg ${
              page === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-50"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ⭐ SUCCESS TOAST */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
