"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Company {
  id: string;
  name: string;
  license_count: number;
  created_at: string;
}

interface CompanyWithUsage extends Company {
  active_machines: number;
  free_licenses: number;
  usage_percent: number;
}

type SortColumn = "name" | "license_count" | "active_machines" | "free_licenses" | "usage_percent" | "created_at";
type SortDirection = "asc" | "desc";

export default function AdminLicenseOverviewPage() {
  const supabase = supabaseBrowser();

  const [companies, setCompanies] = useState<CompanyWithUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortColumn>("usage_percent");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<CompanyWithUsage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load companies
    const { data: companiesData } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });

    // Load machine counts
    const { data: machineCounts } = await supabase
      .from("machines")
      .select("company_id, active");

    const usageMap: Record<string, number> = {};

    machineCounts?.forEach((m) => {
      if (m.active) {
        usageMap[m.company_id] = (usageMap[m.company_id] || 0) + 1;
      }
    });

    const formatted: CompanyWithUsage[] =
      companiesData?.map((c) => {
        const active = usageMap[c.id] || 0;
        const free = c.license_count - active;
        const percent = c.license_count === 0 ? 0 : Math.round((active / c.license_count) * 100);

        return {
          ...c,
          active_machines: active,
          free_licenses: free,
          usage_percent: percent,
        };
      }) || [];

    setCompanies(formatted);
    setLoading(false);
  }

  function handleSort(field: SortColumn) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: SortColumn) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  const processed = useMemo(() => {
    let list = [...companies];

    const s = search.toLowerCase();

    list = list.filter((c) => c.name.toLowerCase().includes(s));

    list.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [companies, search, sortField, sortDir]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function exportCSV() {
    const headers = [
      "Company",
      "Total Licenses",
      "Active Machines",
      "Free Licenses",
      "Usage %",
      "Created At",
    ];

    const rowsCSV = processed.map((c) => [
      c.name,
      c.license_count,
      c.active_machines,
      c.free_licenses,
      c.usage_percent + "%",
      new Date(c.created_at).toLocaleString(),
    ]);

    const csv =
      [headers.join(","), ...rowsCSV.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "license_overview.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((c) => ({
        Company: c.name,
        TotalLicenses: c.license_count,
        ActiveMachines: c.active_machines,
        FreeLicenses: c.free_licenses,
        UsagePercent: c.usage_percent + "%",
        CreatedAt: c.created_at,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "License Overview");
    XLSX.writeFile(workbook, "license_overview.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("License Overview", 14, 10);

    autoTable(doc, {
      head: [["Company", "Total", "Active", "Free", "Usage %", "Created"]],
      body: processed.map((c) => [
        c.name,
        c.license_count,
        c.active_machines,
        c.free_licenses,
        c.usage_percent + "%",
        c.created_at,
      ]),
    });

    doc.save("license_overview.pdf");
  }

  if (loading)
    return (
      <p className="p-6 text-lg text-slate-600 animate-pulse">
        Loading license overview…
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        License Overview
      </h1>

      {/* SEARCH BAR */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
        <input
          type="text"
          placeholder="🔍 Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportCSV}
          className="px-5 py-3 rounded-lg bg-slate-800 text-white font-semibold shadow hover:brightness-110"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="px-5 py-3 rounded-lg bg-green-600 text-white font-semibold shadow hover:brightness-110"
        >
          Export Excel
        </button>

        <button
          onClick={exportPDF}
          className="px-5 py-3 rounded-lg bg-red-600 text-white font-semibold shadow hover:brightness-110"
        >
          Export PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Company{getSortIcon("name")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("license_count")}
              >
                Total Licenses{getSortIcon("license_count")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("active_machines")}
              >
                Active Machines{getSortIcon("active_machines")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("free_licenses")}
              >
                Free Licenses{getSortIcon("free_licenses")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("usage_percent")}
              >
                Usage %{getSortIcon("usage_percent")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50 transition">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.license_count}</td>
                <td className="px-4 py-3">{c.active_machines}</td>
                <td className="px-4 py-3">{c.free_licenses}</td>
                <td className="px-4 py-3">{c.usage_percent}%</td>

                <td className="px-4 py-3">
                  <a
                    href={`/admin/company/${c.id}/machines`}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Machines
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300 transition"
        >
          Previous
        </button>

        <span className="text-sm font-semibold">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300 transition"
        >
          Next
        </button>
      </div>

    </div>
  );
}
