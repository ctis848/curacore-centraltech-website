"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

interface RenewalRecord {
  id: string;
  amount: number;
  reference: string;
  paidat: string;
  status: string;
  licensecount: number;
}

export default function RenewalHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("paidat");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;
        if (!user) {
          setFatalError("You must be logged in.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("AnnualPaymentHistory")
          .select("*")
          .eq("userid", user.id)
          .order("paidat", { ascending: false });

        if (error) {
          console.error("Error loading renewal history:", error);
          setFatalError("Unable to load renewal history.");
          setLoading(false);
          return;
        }

        setRows(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setFatalError("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // -----------------------------
  // FILTER + SORT PIPELINE
  // -----------------------------
  const filtered = useMemo(() => {
    let r = [...rows];

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(s) ||
          x.status.toLowerCase().includes(s)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      r = r.filter((x) => x.status === statusFilter);
    }

    // Date range
    if (fromDate) {
      r = r.filter((x) => new Date(x.paidat) >= new Date(fromDate));
    }
    if (toDate) {
      r = r.filter((x) => new Date(x.paidat) <= new Date(toDate));
    }

    // Sorting
    r.sort((a, b) => {
      const A = a[sortField as keyof RenewalRecord];
      const B = b[sortField as keyof RenewalRecord];

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return r;
  }, [rows, search, statusFilter, fromDate, toDate, sortField, sortDir]);

  // -----------------------------
  // EXPORT FUNCTIONS
  // -----------------------------
  const exportCSV = () => {
    const csvRows = [
      ["Date", "Amount", "Licenses", "Reference", "Status"],
      ...filtered.map((r) => [
        new Date(r.paidat).toLocaleString(),
        r.amount,
        r.licensecount,
        r.reference,
        r.status,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "renewal-history.csv";
    link.click();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        Date: new Date(r.paidat).toLocaleString(),
        Amount: r.amount,
        Licenses: r.licensecount,
        Reference: r.reference,
        Status: r.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Renewals");
    XLSX.writeFile(workbook, "renewal-history.xlsx");
  };

  const exportPDF = () => {
    window.print(); // Simple browser PDF export
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Renewal History</h1>

      {fatalError && <p className="text-red-600">{fatalError}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search reference or status..."
          className="border px-3 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 mb-4">
        <button onClick={exportCSV} className="px-4 py-2 bg-slate-800 text-white rounded">
          Export CSV
        </button>
        <button onClick={exportExcel} className="px-4 py-2 bg-green-700 text-white rounded">
          Export Excel
        </button>
        <button onClick={exportPDF} className="px-4 py-2 bg-red-700 text-white rounded">
          Export PDF
        </button>
      </div>

      {/* Table */}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No renewal records found.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full border">
            <thead className="bg-slate-900 text-white">
              <tr>
                {["paidat", "amount", "licensecount", "reference", "status"].map(
                  (field) => (
                    <th
                      key={field}
                      className="px-4 py-3 text-left cursor-pointer"
                      onClick={() => {
                        if (sortField === field) {
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(field);
                          setSortDir("asc");
                        }
                      }}
                    >
                      {field.toUpperCase()}
                      {sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {new Date(r.paidat).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    ₦{Number(r.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{r.licensecount}</td>
                  <td className="px-4 py-3 font-mono">{r.reference}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
