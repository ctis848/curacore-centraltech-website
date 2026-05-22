"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TransferRequest = {
  id: string;
  licenseId: string;
  oldUserEmail: string;
  newUserEmail: string;
  status: string;
  createdAt: string;
};

export default function TransferRequestsPage() {
  const supabase = supabaseBrowser();

  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [licenseFilter, setLicenseFilter] = useState("ALL");
  const [newEmailFilter, setNewEmailFilter] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] =
    useState<keyof TransferRequest>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("LicenseTransferRequest")
      .select("*")
      .eq("oldUserEmail", user.email)
      .order("createdAt", { ascending: false });

    if (!error) setRequests(data as TransferRequest[]);
    setLoading(false);
  }

  function handleSort(field: keyof TransferRequest) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: keyof TransferRequest) {
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

  function setPresetDays(days: number) {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(now.toISOString().slice(0, 10));
  }

  function setPresetThisYear() {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }

  const processed = useMemo(() => {
    let rows = [...requests];

    const s = search.toLowerCase();

    rows = rows.filter((r) => {
      const matchesSearch =
        r.licenseId.toLowerCase().includes(s) ||
        r.oldUserEmail.toLowerCase().includes(s) ||
        r.newUserEmail.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;

      const matchesLicense =
        licenseFilter === "ALL" || r.licenseId === licenseFilter;

      const matchesNewEmail =
        r.newUserEmail.toLowerCase().includes(newEmailFilter.toLowerCase());

      const matchesDate = applyDateFilter(r.createdAt);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLicense &&
        matchesNewEmail &&
        matchesDate
      );
    });

    rows.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    requests,
    search,
    statusFilter,
    licenseFilter,
    newEmailFilter,
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
    const headers = ["License", "From", "To", "Status", "Created"];
    const rows = processed.map((r) => [
      r.licenseId,
      r.oldUserEmail,
      r.newUserEmail,
      r.status,
      r.createdAt,
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join(
        "\n"
      );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transfer_requests.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((r) => ({
        License: r.licenseId,
        From: r.oldUserEmail,
        To: r.newUserEmail,
        Status: r.status,
        Created: r.createdAt,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfer Requests");
    XLSX.writeFile(workbook, "transfer_requests.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Transfer Requests", 14, 10);

    autoTable(doc, {
      head: [["License", "From", "To", "Status", "Created"]],
      body: processed.map((r) => [
        String(r.licenseId),
        String(r.oldUserEmail),
        String(r.newUserEmail),
        String(r.status),
        String(r.createdAt),
      ]),
    });

    doc.save("transfer_requests.pdf");
  }

  const uniqueLicenses = Array.from(
    new Set(requests.map((r) => r.licenseId))
  );

  const uniqueStatuses = Array.from(
    new Set(requests.map((r) => r.status))
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Transfer Requests
      </h1>

      {/* FILTER BAR */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-4">

        <input
          type="text"
          placeholder="🔍 Search by license, email, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg shadow-sm w-full focus:ring-2 focus:ring-purple-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <select
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
          >
            <option value="ALL">All Licenses</option>
            {uniqueLicenses.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded-lg shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by new user email"
            value={newEmailFilter}
            onChange={(e) => setNewEmailFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-600">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-600">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPresetDays(7)}
            className="px-3 py-2 text-xs bg-purple-200 rounded-lg hover:bg-purple-300"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPresetDays(30)}
            className="px-3 py-2 text-xs bg-purple-200 rounded-lg hover:bg-purple-300"
          >
            Last 30 Days
          </button>
          <button
            onClick={setPresetThisYear}
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
                onClick={() => handleSort("licenseId")}
              >
                License{getSortIcon("licenseId")}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("oldUserEmail")}
              >
                From{getSortIcon("oldUserEmail")}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("newUserEmail")}
              >
                To{getSortIcon("newUserEmail")}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{getSortIcon("status")}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created{getSortIcon("createdAt")}
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((req) => (
              <tr
                key={req.id}
                className={`border-t hover:bg-slate-50 transition ${
                  req.status === "APPROVED"
                    ? "bg-green-50"
                    : req.status === "PENDING"
                    ? "bg-yellow-50"
                    : req.status === "REJECTED"
                    ? "bg-red-50"
                    : ""
                }`}
              >
                <td className="px-4 py-3">{req.licenseId}</td>
                <td className="px-4 py-3">{req.oldUserEmail}</td>
                <td className="px-4 py-3">{req.newUserEmail}</td>
                <td className="px-4 py-3 font-bold">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === "APPROVED"
                        ? "bg-green-200 text-green-800"
                        : req.status === "PENDING"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300"
        >
          Previous
        </button>

        <span className="text-sm font-semibold">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
