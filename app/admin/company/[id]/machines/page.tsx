"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Machine {
  id: string;
  device_id: string;
  company_id: string;
  active: boolean;
  created_at: string;
  last_seen?: string | null;
}

interface Company {
  id: string;
  name: string;
  license_count: number;
}

type SortColumn = "device_id" | "created_at" | "active";
type SortDirection = "asc" | "desc";

interface CompanyMachinesApiResponse {
  success: boolean;
  company?: Company;
  machines?: Machine[];
  message?: string;
  error?: unknown;
}

export default function AdminCompanyMachinesPage({ params }: any) {
  const router = useRouter();

  // ⭐ Next.js 16 — unwrap params safely
  const { id: companyId } = use<{ id: string }>(params);

  // ⭐ Prevent undefined ID from breaking API
  if (!companyId) {
    return (
      <div className="p-6 text-red-600 text-lg font-semibold">
        Invalid company ID.  
        <button
          onClick={() => router.push("/admin/company")}
          className="ml-4 px-4 py-2 bg-slate-800 text-white rounded-lg"
        >
          Back
        </button>
      </div>
    );
  }

  const [company, setCompany] = useState<Company | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortField, setSortField] = useState<SortColumn>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<Machine | null>(null);

  function getActivationAge(date: string) {
    const now = new Date();
    const act = new Date(date);
    const diff = now.getTime() - act.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  useEffect(() => {
    loadData();
  }, [companyId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/company/${companyId}/machines`);
      const json: CompanyMachinesApiResponse = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load company machines.");

        if (res.status === 404) {
          router.push("/admin/company");
        }

        setLoading(false);
        return;
      }

      setCompany(json.company ?? null);
      setMachines(json.machines ?? []);
      setLoading(false);
    } catch (err) {
      console.error("Load error:", err);
      setError("An unexpected error occurred while loading machines.");
      setLoading(false);
    }
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
    let list = [...machines];

    const s = search.toLowerCase();

    list = list.filter((r) => {
      const matchesSearch = r.device_id.toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && r.active) ||
        (statusFilter === "INACTIVE" && !r.active);

      return matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [machines, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function exportCSV() {
    const headers = [
      "Machine ID",
      "Machine Key",
      "Activated On",
      "Activation Age",
      "Status",
    ];

    const rowsCSV = processed.map((r) => [
      r.id,
      r.device_id,
      new Date(r.created_at).toLocaleString(),
      getActivationAge(r.created_at),
      r.active ? "Active" : "Inactive",
    ]);

    const csv =
      [headers.join(","), ...rowsCSV.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${company?.name ?? "company"}_machines.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((r) => ({
        MachineID: r.id,
        MachineKey: r.device_id,
        ActivatedOn: r.created_at,
        ActivationAge: getActivationAge(r.created_at),
        Status: r.active ? "Active" : "Inactive",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Machines");
    XLSX.writeFile(workbook, `${company?.name ?? "company"}_machines.xlsx`);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text(`${company?.name ?? "Company"} - Machine List`, 14, 10);

    autoTable(doc, {
      head: [["Machine ID", "Machine Key", "Activated On", "Status"]],
      body: processed.map((r) => [
        r.id,
        r.device_id,
        r.created_at,
        r.active ? "Active" : "Inactive",
      ]),
    });

    doc.save(`${company?.name ?? "company"}_machines.pdf`);
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-slate-700">{error}</p>
        <button
          onClick={() => router.push("/admin/company")}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:brightness-110"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="h-20 w-full bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-32 w-full bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 w-full bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!company) {
    router.push("/admin/company");
    return null;
  }

  const activeCount = machines.filter((m) => m.active).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        {company.name} — Machines
      </h1>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <p className="text-lg font-semibold text-slate-700">
          License Usage:{" "}
          <span className="text-blue-600">
            {activeCount} / {company.license_count}
          </span>
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-4">

        <input
          type="text"
          placeholder="🔍 Search by machine key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-lg shadow-sm w-full focus:ring-2 focus:ring-purple-400"
        />

        <select
          className="px-3 py-2 border rounded-lg shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

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

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("device_id")}
              >
                Machine Key{getSortIcon("device_id")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Activated On{getSortIcon("created_at")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                Activation Age
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("active")}
              >
                Status{getSortIcon("active")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="border-b hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono break-all">{row.device_id}</td>
                <td className="px-4 py-3">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-blue-700 font-semibold">
                  {getActivationAge(row.created_at)}
                </td>
                <td className="px-4 py-3">
                  {row.active ? (
                    <span className="text-green-600 font-bold">Active</span>
                  ) : (
                    <span className="text-red-600 font-bold">Inactive</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(row)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-fadeIn">

            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
              Machine Details
            </h2>

            <div className="space-y-2 text-slate-700">
              <p><strong>Machine ID:</strong> {selected.id}</p>
              <p><strong>Machine Key:</strong> {selected.device_id}</p>
              <p><strong>Activated On:</strong> {new Date(selected.created_at).toLocaleString()}</p>
              <p><strong>Activation Age:</strong> {getActivationAge(selected.created_at)}</p>
              <p>
                <strong>Status:</strong>{" "}
                {selected.active ? (
                  <span className="text-green-600 font-bold">Active</span>
                ) : (
                  <span className="text-red-600 font-bold">Inactive</span>
                )}
              </p>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:brightness-110 shadow"
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
