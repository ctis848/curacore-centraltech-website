"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type LicenseRow = {
  id: string;
  productName: string | null;
  licenseKey: string | null;
  status: string;
  user_id: string;
  created_at: string;
  requestKey?: string | null;
  notes?: string | null;
};

export default function ClientLicensesPage() {
  const supabase = supabaseBrowser();

  const [user, setUser] = useState<any>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [requestKeyFilter, setRequestKeyFilter] = useState<string>("");
  const [licenseKeyFilter, setLicenseKeyFilter] = useState<string>("");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [sortField, setSortField] = useState<keyof LicenseRow>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ⭐ View Modal State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseRow | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, [supabase]);

  useEffect(() => {
    if (!user?.id) return;
    loadLicenses();
  }, [user, activeTab]);

  async function loadLicenses() {
    setLoading(true);

    if (activeTab === "ACTIVE") {
      const { data } = await supabase
        .from("LicenseRequest")
        .select(`
          id,
          productName,
          licenseKey,
          status,
          userId,
          requestedAt,
          requestKey,
          notes
        `)
        .eq("userId", user.id)
        .eq("status", "APPROVED")
        .order("requestedAt", { ascending: false });

      const mapped: LicenseRow[] = (data || []).map((l: any) => ({
        id: l.id,
        productName: l.productName,
        licenseKey: l.licenseKey,
        status: l.status,
        user_id: l.userId,
        created_at: l.requestedAt,
        requestKey: l.requestKey,
        notes: l.notes ?? null,
      }));

      setLicenses(mapped);
      setLoading(false);
      setPage(1);
      return;
    }

    if (activeTab === "PENDING") {
      const { data: reqs } = await supabase
        .from("LicenseRequest")
        .select(`
          id,
          productName,
          requestKey,
          status,
          userId,
          requestedAt,
          notes
        `)
        .eq("userId", user.id)
        .eq("status", "PENDING")
        .order("requestedAt", { ascending: false });

      const pendingMapped: LicenseRow[] = (reqs || []).map((r: any) => ({
        id: r.id,
        productName: r.productName,
        licenseKey: null,
        status: "PENDING",
        user_id: r.userId,
        created_at: r.requestedAt,
        requestKey: r.requestKey,
        notes: r.notes ?? null,
      }));

      setLicenses(pendingMapped);
      setLoading(false);
      setPage(1);
    }
  }

  function handleSort(field: keyof LicenseRow) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: keyof LicenseRow) {
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
    let rows = [...licenses];

    const s = search.toLowerCase();

    rows = rows.filter((l) => {
      const matchesSearch =
        (l.productName ?? "").toLowerCase().includes(s) ||
        (l.licenseKey ?? "").toLowerCase().includes(s) ||
        (l.status ?? "").toLowerCase().includes(s) ||
        (l.requestKey ?? "").toLowerCase().includes(s) ||
        (l.notes ?? "").toLowerCase().includes(s);

      const matchesProduct =
        productFilter === "ALL" ||
        (l.productName ?? "") === productFilter;

      const matchesStatus =
        statusFilter === "ALL" || l.status === statusFilter;

      const matchesRequestKey =
        (l.requestKey ?? "").toLowerCase().includes(
          requestKeyFilter.toLowerCase()
        );

      const matchesLicenseKey =
        (l.licenseKey ?? "").toLowerCase().includes(
          licenseKeyFilter.toLowerCase()
        );

      const matchesDate = applyDateFilter(l.created_at);

      return (
        matchesSearch &&
        matchesProduct &&
        matchesStatus &&
        matchesRequestKey &&
        matchesLicenseKey &&
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
    licenses,
    search,
    productFilter,
    statusFilter,
    requestKeyFilter,
    licenseKeyFilter,
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

  function copyLicenseKey(key: string | null) {
    navigator.clipboard.writeText(key ?? "");
    alert("License key copied");
  }

  function downloadLicense(lic: LicenseRow) {
    const content = `PRODUCT=${lic.productName ?? ""}
LICENSE_KEY=${lic.licenseKey ?? ""}
USER=${lic.user_id ?? ""}
NOTES=${lic.notes ?? ""}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${lic.productName ?? "license"}-license.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function downloadAllLicenses() {
    if (processed.length === 0) return;

    const lines = processed.map(
      (lic) =>
        `PRODUCT=${lic.productName ?? ""}
LICENSE_KEY=${lic.licenseKey ?? ""}
STATUS=${lic.status}
USER=${lic.user_id}
CREATED=${lic.created_at}
REQUEST_KEY=${lic.requestKey ?? ""}
NOTES=${lic.notes ?? ""}
---\n`
    );

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "all-licenses.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((l) => ({
        Product: l.productName ?? "",
        LicenseKey: l.licenseKey ?? "",
        Notes: l.notes ?? "",
        Status: l.status,
        Created: l.created_at,
        RequestKey: l.requestKey ?? "",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenses");
    XLSX.writeFile(workbook, "licenses.xlsx");
  }

  function exportCSV() {
    const headers = [
      "Product",
      "LicenseKey",
      "Notes",
      "Status",
      "Created",
      "RequestKey",
    ];
    const rows = processed.map((l) => [
      l.productName ?? "",
      l.licenseKey ?? "",
      l.notes ?? "",
      l.status,
      l.created_at,
      l.requestKey ?? "",
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "licenses.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Licenses", 14, 10);

    autoTable(doc, {
      head: [["Product", "License Key", "Notes", "Status", "Created", "Request Key"]],
      body: processed.map((l) => [
        String(l.productName ?? ""),
        String(l.licenseKey ?? ""),
        String(l.notes ?? ""),
        String(l.status ?? ""),
        String(l.created_at ?? ""),
        String(l.requestKey ?? ""),
      ]),
    });

    doc.save("licenses.pdf");
  }

  const uniqueProducts = Array.from(
    new Set(licenses.map((l) => l.productName).filter(Boolean))
  ) as string[];

  const uniqueStatuses = Array.from(
    new Set(licenses.map((l) => l.status).filter(Boolean))
  ) as string[];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        {activeTab === "ACTIVE" ? "Active Licenses" : "Pending License Requests"}
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded ${
            activeTab === "ACTIVE"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          Active Licenses
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded ${
            activeTab === "PENDING"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          Pending Requests
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by product, key, request key, status, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />

        <select
          className="px-3 py-2 border rounded"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="ALL">All Products</option>
          {uniqueProducts.map((p) => (
            <option key={p} value={p}>
              {p}
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
          placeholder="Filter by Request Key"
          value={requestKeyFilter}
          onChange={(e) => setRequestKeyFilter(e.target.value)}
          className="px-3 py-2 border rounded min-w-[180px]"
        />

        <input
          type="text"
          placeholder="Filter by License Key"
          value={licenseKeyFilter}
          onChange={(e) => setLicenseKeyFilter(e.target.value)}
          className="px-3 py-2 border rounded min-w-[180px]"
        />
      </div>

      {/* DATE FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Created From:</span>
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
        <button
          onClick={downloadAllLicenses}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Download All Licenses
        </button>
      </div>

      {/* TABLE */}
      {loading && <p className="text-slate-500">Loading licenses…</p>}

      {!loading && processed.length === 0 && (
        <p className="text-slate-500">
          {activeTab === "ACTIVE"
            ? "No active licenses found."
            : "No pending requests found."}
        </p>
      )}

      {!loading && processed.length > 0 && (
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer text-left"
                  onClick={() => handleSort("productName")}
                >
                  Product{getSortIcon("productName")}
                </th>

                {activeTab === "PENDING" && (
                  <th
                    className="px-4 py-2 cursor-pointer text-left"
                    onClick={() => handleSort("requestKey")}
                  >
                    Request Key{getSortIcon("requestKey")}
                  </th>
                )}

                <th
                  className="px-4 py-2 cursor-pointer text-left"
                  onClick={() => handleSort("licenseKey")}
                >
                  License Key{getSortIcon("licenseKey")}
                </th>

                <th
                  className="px-4 py-2 cursor-pointer text-left"
                  onClick={() => handleSort("notes")}
                >
                  Notes{getSortIcon("notes")}
                </th>

                <th
                  className="px-4 py-2 cursor-pointer text-left"
                  onClick={() => handleSort("status")}
                >
                  Status{getSortIcon("status")}
                </th>

                <th
                  className="px-4 py-2 cursor-pointer text-left"
                  onClick={() => handleSort("created_at")}
                >
                  Created{getSortIcon("created_at")}
                </th>

                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((lic) => (
                <tr
                  key={lic.id}
                  className={`border-t hover:bg-slate-50 ${
                    lic.status === "ACTIVE"
                      ? "bg-green-50"
                      : lic.status === "PENDING"
                      ? "bg-yellow-50"
                      : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2">{lic.productName ?? "N/A"}</td>

                  {activeTab === "PENDING" && (
                    <td className="px-4 py-2 font-mono break-all">
                      {lic.requestKey ?? "N/A"}
                    </td>
                  )}

                  <td className="px-4 py-2 font-mono break-all">
                    {lic.licenseKey ?? "N/A"}
                  </td>

                  <td className="px-4 py-2">
                    {lic.notes ? (
                      <span className="text-slate-700">{lic.notes}</span>
                    ) : (
                      <span className="text-slate-400 italic">No notes</span>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        lic.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : lic.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {lic.status}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    {new Date(lic.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-2 space-x-3">
                    <button
                      onClick={() => {
                        setSelectedLicense(lic);
                        setViewOpen(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>

                    {lic.licenseKey && (
                      <>
                        <button
                          onClick={() => copyLicenseKey(lic.licenseKey)}
                          className="text-indigo-600 hover:underline"
                        >
                          Copy
                        </button>

                        <button
                          onClick={() => downloadLicense(lic)}
                          className="text-green-600 hover:underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      {/* VIEW LICENSE MODAL */}
      {viewOpen && selectedLicense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">License Details</h2>

            <div className="space-y-3">
              <p><strong>Product:</strong> {selectedLicense.productName}</p>
              <p><strong>License Key:</strong> {selectedLicense.licenseKey}</p>
              <p><strong>Request Key:</strong> {selectedLicense.requestKey}</p>
              <p><strong>Status:</strong> {selectedLicense.status}</p>
              <p><strong>Created:</strong> {new Date(selectedLicense.created_at).toLocaleString()}</p>

              <div>
                <label className="font-semibold">Notes</label>
                <textarea
                  className="w-full border rounded p-2 mt-1 bg-slate-100"
                  rows={4}
                  value={selectedLicense.notes || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 bg-slate-200 rounded"
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
