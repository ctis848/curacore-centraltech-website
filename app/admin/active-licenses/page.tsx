"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminActiveLicensesPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortField, setSortField] = useState("requestedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    setLoading(true);

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
      .eq("status", "APPROVED")
      .order("requestedAt", { ascending: false });

    setLicenses(data || []);
    setLoading(false);
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: string) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  const processed = useMemo(() => {
    let rows = [...licenses];

    const s = search.toLowerCase();

    rows = rows.filter((l) => {
      const matchesSearch =
        (l.productName ?? "").toLowerCase().includes(s) ||
        (l.licenseKey ?? "").toLowerCase().includes(s) ||
        (l.requestKey ?? "").toLowerCase().includes(s) ||
        (l.notes ?? "").toLowerCase().includes(s);

      const matchesProduct =
        productFilter === "ALL" || l.productName === productFilter;

      const matchesStatus =
        statusFilter === "ALL" || l.status === statusFilter;

      return matchesSearch && matchesProduct && matchesStatus;
    });

    rows.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [licenses, search, productFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function openViewModal(lic: any) {
    setSelectedLicense(lic);
    setViewOpen(true);
  }

  async function loadUserDetails(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("id, email, fullName, tenantId, created_at")
      .eq("id", userId)
      .single();

    setUserDetails(data);
    setUserDrawerOpen(true);
  }

  function exportCSV() {
    const headers = ["Product", "LicenseKey", "Notes", "User", "Created"];
    const rows = licenses.map((l) => [
      l.productName,
      l.licenseKey,
      l.notes || "",
      l.userId,
      l.requestedAt,
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "active-licenses.csv";
    a.click();
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      licenses.map((l) => ({
        Product: l.productName,
        LicenseKey: l.licenseKey,
        Notes: l.notes || "",
        User: l.userId,
        Created: l.requestedAt,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Licenses");
    XLSX.writeFile(workbook, "active-licenses.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Active Licenses", 14, 10);

    autoTable(doc, {
      head: [["Product", "License Key", "Notes", "User", "Created"]],
      body: licenses.map((l) => [
        l.productName,
        l.licenseKey,
        l.notes || "",
        l.userId,
        l.requestedAt,
      ]),
    });

    doc.save("active-licenses.pdf");
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Active Licenses
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">

        <input
          type="text"
          placeholder="Search by product, key, request key, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg shadow-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-purple-400"
        />

        <select
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="ALL">All Products</option>
          {Array.from(new Set(licenses.map((l) => l.productName))).map(
            (p: any) =>
              p && (
                <option key={p} value={p}>
                  {p}
                </option>
              )
          )}
        </select>

        <select
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="APPROVED">APPROVED</option>
        </select>

        <button
          onClick={exportCSV}
          className="px-5 py-3 bg-slate-800 text-white rounded-lg shadow hover:brightness-110"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="px-5 py-3 bg-emerald-600 text-white rounded-lg shadow hover:brightness-110"
        >
          Export Excel
        </button>

        <button
          onClick={exportPDF}
          className="px-5 py-3 bg-red-600 text-white rounded-lg shadow hover:brightness-110"
        >
          Export PDF
        </button>
      </div>

      {/* TABLE */}
      {!loading && (
        <div className="overflow-x-auto border rounded-2xl bg-white shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">
              <tr>
                <th
                  className="px-5 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("productName")}
                >
                  Product{getSortIcon("productName")}
                </th>

                <th
                  className="px-5 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("licenseKey")}
                >
                  License Key{getSortIcon("licenseKey")}
                </th>

                <th
                  className="px-5 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("notes")}
                >
                  Notes{getSortIcon("notes")}
                </th>

                <th
                  className="px-5 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("requestedAt")}
                >
                  Created{getSortIcon("requestedAt")}
                </th>

                <th className="px-5 py-3 text-left font-semibold">User</th>
                <th className="px-5 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((lic) => (
                <tr
                  key={lic.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-3">{lic.productName}</td>

                  <td className="px-5 py-3 font-mono break-all">
                    {lic.licenseKey}
                  </td>

                  <td className="px-5 py-3">
                    {lic.notes || (
                      <span className="italic text-slate-400">No notes</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    {new Date(lic.requestedAt).toLocaleString()}
                  </td>

                  <td className="px-5 py-3">{lic.userId}</td>

                  <td className="px-5 py-3 space-x-3">
                    <button
                      onClick={() => openViewModal(lic)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>

                    <button
                      onClick={() => loadUserDetails(lic.userId)}
                      className="text-indigo-600 hover:underline"
                    >
                      User
                    </button>
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

      {/* VIEW LICENSE MODAL */}
      {viewOpen && selectedLicense && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
              License Details
            </h2>

            <div className="space-y-3 text-sm text-slate-700">
              <p><strong>Product:</strong> {selectedLicense.productName}</p>
              <p><strong>License Key:</strong> {selectedLicense.licenseKey}</p>
              <p><strong>Request Key:</strong> {selectedLicense.requestKey}</p>
              <p><strong>User ID:</strong> {selectedLicense.userId}</p>
              <p><strong>Created:</strong> {new Date(selectedLicense.requestedAt).toLocaleString()}</p>

              <div>
                <label className="font-semibold text-slate-800">Notes</label>
                <textarea
                  className="w-full border rounded-lg p-3 mt-1 bg-slate-50 focus:ring-2 focus:ring-purple-400"
                  rows={4}
                  value={selectedLicense.notes || ""}
                  onChange={(e) =>
                    setSelectedLicense({ ...selectedLicense, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setViewOpen(false)}
                className="px-5 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  await supabase
                    .from("LicenseRequest")
                    .update({ notes: selectedLicense.notes })
                    .eq("id", selectedLicense.id);

                  setViewOpen(false);
                  loadLicenses();
                }}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow hover:brightness-110"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS DRAWER */}
      {userDrawerOpen && userDetails && (
        <div className="fixed inset-0 flex justify-end bg-black/30 backdrop-blur-sm z-50">
          <div className="w-96 bg-white h-full shadow-2xl p-6 overflow-y-auto border-l border-slate-200">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
              User Details
            </h2>

            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>ID:</strong> {userDetails.id}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Name:</strong> {userDetails.fullName}</p>
              <p><strong>Tenant:</strong> {userDetails.tenantId}</p>
              <p><strong>Created:</strong> {new Date(userDetails.created_at).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setUserDrawerOpen(false)}
              className="mt-6 px-5 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
