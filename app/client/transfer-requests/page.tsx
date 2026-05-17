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

  const [sortField, setSortField] = useState<keyof TransferRequest>("createdAt");
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transfer Requests</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by license, email, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />

        <select
          className="px-3 py-2 border rounded"
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
          className="px-3 py-2 border rounded"
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
          className="px-3 py-2 border rounded min-w-[180px]"
        />
      </div>

      {/* DATE FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>

        <button
          onClick={() => setPresetDays(7)}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPresetDays(30)}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          Last 30 Days
        </button>
        <button
          onClick={setPresetThisYear}
          className="px-3 py-1 text-xs bg-slate-200 rounded"
        >
          This Year
        </button>
        <button
          onClick={() => {
            setDateFrom("");
            setDateTo("");
          }}
          className="px-3 py-1 text-xs bg-slate-100 rounded"
        >
          Clear Dates
        </button>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-700 text-white rounded"
        >
          Export CSV
        </button>
        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Export PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("licenseId")}
              >
                License{getSortIcon("licenseId")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("oldUserEmail")}
              >
                From{getSortIcon("oldUserEmail")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("newUserEmail")}
              >
                To{getSortIcon("newUserEmail")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{getSortIcon("status")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
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
                className={`border-t hover:bg-slate-50 ${
                  req.status === "APPROVED"
                    ? "bg-green-50"
                    : req.status === "PENDING"
                    ? "bg-yellow-50"
                    : req.status === "REJECTED"
                    ? "bg-red-50"
                    : ""
                }`}
              >
                <td className="px-4 py-2">{req.licenseId}</td>
                <td className="px-4 py-2">{req.oldUserEmail}</td>
                <td className="px-4 py-2">{req.newUserEmail}</td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">
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
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
