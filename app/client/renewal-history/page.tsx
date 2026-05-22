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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const filtered = useMemo(() => {
    let r = [...rows];

    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(s) ||
          x.status.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "ALL") {
      r = r.filter((x) => x.status === statusFilter);
    }

    if (fromDate) {
      r = r.filter((x) => new Date(x.paidat) >= new Date(fromDate));
    }
    if (toDate) {
      r = r.filter((x) => new Date(x.paidat) <= new Date(toDate));
    }

    r.sort((a, b) => {
      const A = a[sortField as keyof RenewalRecord];
      const B = b[sortField as keyof RenewalRecord];

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return r;
  }, [rows, search, statusFilter, fromDate, toDate, sortField, sortDir]);

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
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renewal History
      </h1>

      {fatalError && (
        <p className="text-red-600 font-semibold">{fatalError}</p>
      )}

      {loading && (
        <p className="text-slate-500 animate-pulse text-lg">
          Loading renewal history…
        </p>
      )}

      {/* Filters */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-4">

        <input
          type="text"
          placeholder="🔍 Search reference or status..."
          className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <select
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportCSV}
          className="px-5 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold shadow hover:brightness-110"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="px-5 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow hover:brightness-110"
        >
          Export Excel
        </button>

        <button
          onClick={exportPDF}
          className="px-5 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:brightness-110"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No renewal records found.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
              <tr>
                {["paidat", "amount", "licensecount", "reference", "status"].map(
                  (field) => (
                    <th
                      key={field}
                      className="px-4 py-3 text-left font-semibold cursor-pointer"
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
                      {sortField === field ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    {new Date(r.paidat).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    ₦{Number(r.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{r.licensecount}</td>
                  <td className="px-4 py-3 font-mono">{r.reference}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.status === "SUCCESS"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
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
