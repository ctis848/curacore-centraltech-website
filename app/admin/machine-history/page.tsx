"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Machine {
  id: string;
  device_id: string;
  company_id: string;
  active: boolean;
  created_at: string;
  device_name: string | null;
  ip_address: string | null;
  companies: {
    name: string;
  } | null;
}

type SortColumn =
  | "device_id"
  | "created_at"
  | "device_name"
  | "ip_address"
  | "active"
  | "company";
type SortDirection = "asc" | "desc";

export default function AdminMachineHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<SortColumn>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 15;

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
  }, []);

  async function loadData() {
    const { data, error } = await supabase
      .from("machines")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setRows(data || []);
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

  function applyDateFilter(created: string) {
    if (!created) return false;
    const createdDate = new Date(created).getTime();
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (createdDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      if (createdDate > to) return false;
    }
    return true;
  }

  const processed = useMemo(() => {
    let list = [...rows];

    const s = search.toLowerCase();

    list = list.filter((r) => {
      const matchesSearch =
        r.device_id.toLowerCase().includes(s) ||
        (r.device_name ?? "").toLowerCase().includes(s) ||
        (r.companies?.name ?? "").toLowerCase().includes(s);

      const matchesCompany =
        companyFilter === "ALL" ||
        r.companies?.name === companyFilter;

      const matchesDevice =
        (r.device_name ?? "").toLowerCase().includes(deviceFilter.toLowerCase());

      const matchesIp =
        (r.ip_address ?? "").toLowerCase().includes(ipFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && r.active) ||
        (statusFilter === "INACTIVE" && !r.active);

      const matchesDate = applyDateFilter(r.created_at);

      return (
        matchesSearch &&
        matchesCompany &&
        matchesDevice &&
        matchesIp &&
        matchesStatus &&
        matchesDate
      );
    });

    list.sort((a, b) => {
      const A =
        sortField === "company"
          ? (a.companies?.name ?? "").toLowerCase()
          : (a[sortField] ?? "").toString().toLowerCase();

      const B =
        sortField === "company"
          ? (b.companies?.name ?? "").toLowerCase()
          : (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    rows,
    search,
    companyFilter,
    deviceFilter,
    ipFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function exportCSV() {
    const headers = [
      "Machine ID",
      "Device ID",
      "Company",
      "Activated On",
      "Activation Age",
      "Device Name",
      "IP Address",
      "Status",
    ];

    const rowsCSV = processed.map((r) => [
      r.id,
      r.device_id,
      r.companies?.name ?? "",
      new Date(r.created_at).toLocaleString(),
      getActivationAge(r.created_at),
      r.device_name || "",
      r.ip_address || "",
      r.active ? "Active" : "Inactive",
    ]);

    const csv =
      [headers.join(","), ...rowsCSV.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_machine_history.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((r) => ({
        MachineID: r.id,
        DeviceID: r.device_id,
        Company: r.companies?.name,
        ActivatedOn: r.created_at,
        ActivationAge: getActivationAge(r.created_at),
        DeviceName: r.device_name,
        IPAddress: r.ip_address,
        Status: r.active ? "Active" : "Inactive",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Machine History");
    XLSX.writeFile(workbook, "admin_machine_history.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Admin Machine Activation History", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Machine ID",
          "Device ID",
          "Company",
          "Activated On",
          "Device",
          "IP",
          "Status",
        ],
      ],
      body: processed.map((r) => [
        r.id,
        r.device_id,
        r.companies?.name ?? "",
        r.created_at,
        r.device_name ?? "",
        r.ip_address ?? "",
        r.active ? "Active" : "Inactive",
      ]),
    });

    doc.save("admin_machine_history.pdf");
  }

  if (loading)
    return (
      <p className="p-6 text-lg text-slate-600 animate-pulse">
        Loading machine history…
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Admin Machine Activation History
      </h1>

      {/* FILTER BAR */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-4">

        <input
          type="text"
          placeholder="🔍 Search by device ID, device name, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-lg shadow-sm w-full focus:ring-2 focus:ring-purple-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          <select
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="ALL">All Companies</option>
            {Array.from(new Set(rows.map((r) => r.companies?.name)))
              .filter(Boolean)
              .map((c) => (
                <option key={c} value={c ?? ""}>
                  {c}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Device name"
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm"
          />

          <input
            type="text"
            placeholder="IP address"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm"
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

        {/* DATE FILTERS */}
        <div className="flex flex-wrap gap-3 items-center">

          <div className="flex flex-col">
            <label className="text-xs text-slate-600">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-600">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              const now = new Date();
              const from = new Date();
              from.setDate(now.getDate() - 7);
              setDateFrom(from.toISOString().slice(0, 10));
              setDateTo(now.toISOString().slice(0, 10));
            }}
            className="px-3 py-2 text-xs bg-purple-200 rounded-lg hover:bg-purple-300"
          >
            Last 7 Days
          </button>

          <button
            onClick={() => {
              const now = new Date();
              const from = new Date();
              from.setDate(now.getDate() - 30);
              setDateFrom(from.toISOString().slice(0, 10));
              setDateTo(now.toISOString().slice(0, 10));
            }}
            className="px-3 py-2 text-xs bg-purple-200 rounded-lg hover:bg-purple-300"
          >
            Last 30 Days
          </button>

          <button
            onClick={() => {
              const now = new Date();
              const from = new Date(now.getFullYear(), 0, 1);
              const to = new Date(now.getFullYear(), 11, 31);
              setDateFrom(from.toISOString().slice(0, 10));
              setDateTo(to.toISOString().slice(0, 10));
            }}
            className="px-3 py-2 text-xs bg-blue-200 rounded-lg hover:bg-blue-300"
          >
            This Year
          </button>

          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="px-3 py-2 text-xs bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Clear Dates
          </button>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
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

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("device_id")}
              >
                Device ID{getSortIcon("device_id")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("company")}
              >
                Company{getSortIcon("company")}
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
                onClick={() => handleSort("device_name")}
              >
                Device Name{getSortIcon("device_name")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("ip_address")}
              >
                IP Address{getSortIcon("ip_address")}
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
                <td className="px-4 py-3">{row.companies?.name}</td>
                <td className="px-4 py-3">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-blue-700 font-semibold">
                  {getActivationAge(row.created_at)}
                </td>
                <td className="px-4 py-3">{row.device_name || "Unknown"}</td>
                <td className="px-4 py-3">{row.ip_address || "Unknown"}</td>
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
                    View Details
                  </button>
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

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-fadeIn">

            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
              Machine Details
            </h2>

            <div className="space-y-2 text-slate-700">
              <p><strong>Machine ID:</strong> {selected.id}</p>
              <p><strong>Device ID:</strong> {selected.device_id}</p>
              <p><strong>Company:</strong> {selected.companies?.name ?? "Unknown"}</p>
              <p><strong>Activated On:</strong> {new Date(selected.created_at).toLocaleString()}</p>
              <p><strong>Activation Age:</strong> {getActivationAge(selected.created_at)}</p>
              <p><strong>Device Name:</strong> {selected.device_name || "Unknown"}</p>
              <p><strong>IP Address:</strong> {selected.ip_address || "Unknown"}</p>
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
                className="px-5 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:brightness-110 shadow"
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
