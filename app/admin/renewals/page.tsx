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

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);

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

  const renewalState = (renewal_date: string | null) => {
    if (!renewal_date) return "Unknown";

    const now = new Date();
    const exp = new Date(renewal_date);
    const diff = exp.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 30) return `${days} days left`;
    if (days > 0) return `${days} days (due soon)`;
    if (days === 0) return "Due today";
    return `${Math.abs(days)} days expired`;
  };

  const rowColorClass = (renewal_date: string | null) => {
    const state = renewalState(renewal_date);
    if (state.includes("expired")) return "bg-red-50";
    if (state.includes("due soon") || state.includes("today")) return "bg-yellow-50";
    if (state.includes("days left")) return "bg-green-50";
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

  // ⭐ FIX: Replace alert() with toast
  const sendReminder = async (id: string) => {
    const res = await fetch("/api/admin/renewals/notify-company", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    showSuccess(json.message || "Reminder sent successfully");
  };

  const bulkNotify = async () => {
    if (!selected.length) return showSuccess("No companies selected");

    const res = await fetch("/api/admin/renewals/bulk-notify-company", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    });

    const json = await res.json();
    showSuccess(json.message || "Bulk reminders sent");
  };

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (month) params.set("month", month);
    if (year) params.set("year", year);

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
  }, [page, debouncedSearch, month, year]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renewals
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">

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

        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
            <tr className="border-b text-slate-700">
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  onChange={() => toggleSelectAll(companies)}
                  checked={
                    companies.length > 0 &&
                    companies.every((x) => selected.includes(x.id))
                  }
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
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  Loading renewals…
                </td>
              </tr>
            )}

            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No results found.
                </td>
              </tr>
            )}

            {!loading &&
              companies.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b hover:bg-slate-50 transition ${rowColorClass(
                    c.renewal_date
                  )}`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>

                  <td className="p-4 font-medium">{c.name}</td>

                  <td className="p-4">
                    ₦{Number(c.annual_price).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {c.renewal_date
                      ? new Date(c.renewal_date).toLocaleDateString()
                      : "Unknown"}
                  </td>

                  <td className="p-4">{c.license_count}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        renewalState(c.renewal_date).includes("expired")
                          ? "bg-red-100 text-red-700"
                          : renewalState(c.renewal_date).includes("due soon") ||
                            renewalState(c.renewal_date).includes("today")
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {renewalState(c.renewal_date)}
                    </span>
                  </td>

                  {/* ⭐ FIXED ACTION BUTTONS */}
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
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 border rounded-lg ${
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-50"
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
                  p === page
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50"
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
