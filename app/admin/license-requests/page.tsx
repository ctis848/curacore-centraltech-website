"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type LicenseRequest = {
  id: string;
  userEmail?: string | null;
  user_email?: string | null;
  email?: string | null;
  companyname?: string | null;
  companyName?: string | null;
  company_name?: string | null;
  productName: string;
  requestKey: string;
  status: string;
  requestedAt?: string;

  // normalized fields we add in loadRequests()
  emailDisplay: string;
  companyDisplay: string;
};

export default function LicenseRequestListPage() {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch("/api/admin/license-requests", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          // ⭐ Normalize rows here
          const normalized = data.map((r: LicenseRequest) => ({
            ...r,
            emailDisplay:
              r.userEmail || r.user_email || r.email || "—",
            companyDisplay:
              r.companyname || r.companyName || r.company_name || "—",
          }));

          setRequests(normalized);
        }
      } catch (err) {
        console.error("Failed to load requests:", err);
      }

      setLoading(false);
    }

    loadRequests();
  }, []);

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/admin/license-requests/${id}/reject`, {
        method: "POST",
      });

      if (!res.ok) return;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "REJECTED" } : r
        )
      );
    } catch (err) {
      console.error("Reject error:", err);
    }
  }

  // ⭐ FILTERING (search + dropdowns)
  const filteredRows = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.emailDisplay.toLowerCase().includes(search.toLowerCase()) ||
        r.companyDisplay.toLowerCase().includes(search.toLowerCase()) ||
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;

      const matchesCompany =
        companyFilter === "ALL" ||
        r.companyDisplay === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [search, statusFilter, companyFilter, requests]);

  // ⭐ EXPORT TO EXCEL
  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      requests.map((r) => ({
        Email: r.emailDisplay,
        Company: r.companyDisplay,
        Product: r.productName,
        RequestKey: r.requestKey,
        Status: r.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "License Requests");
    XLSX.writeFile(workbook, "license_requests.xlsx");
  }

  // ⭐ EXPORT TO PDF
  function exportPDF() {
    const doc = new jsPDF();
    doc.text("License Requests", 14, 10);

    autoTable(doc, {
      head: [["Email", "Company", "Product", "Status"]],
      body: requests.map((r) => [
        r.emailDisplay,
        r.companyDisplay,
        r.productName,
        r.status,
      ]),
    });

    doc.save("license_requests.pdf");
  }

  // ⭐ DATAGRID COLUMNS
  const columns = [
    { field: "emailDisplay", headerName: "Email", flex: 1 },
    { field: "companyDisplay", headerName: "Company", flex: 1 },
    { field: "productName", headerName: "Product", flex: 1 },
    {
      field: "requestKey",
      headerName: "Request Key",
      flex: 2,
      renderCell: (params: any) => (
        <span className="font-mono text-xs break-all">{params.value}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => {
        const value = params.value;
        const base = "px-2 py-1 rounded text-xs font-semibold";
        let cls = "bg-gray-200 text-gray-800";

        if (value === "PENDING") cls = "bg-yellow-100 text-yellow-800";
        if (value === "APPROVED") cls = "bg-green-100 text-green-800";
        if (value === "REJECTED") cls = "bg-red-100 text-red-800";

        return <span className={`${base} ${cls}`}>{value}</span>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params: any) => (
        <div className="flex gap-3">
          <Link
            href={`/admin/license-requests/approve?id=${params.row.id}&key=${params.row.requestKey}`}
            className="text-emerald-600 underline"
          >
            Approve
          </Link>

          <button
            onClick={() => handleReject(params.row.id)}
            className="text-red-600 underline disabled:opacity-50"
            disabled={params.row.status === "REJECTED"}
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  // ⭐ GROUP BY COMPANY
  const grouped = useMemo(() => {
    const groups: Record<string, LicenseRequest[]> = {};

    filteredRows.forEach((r) => {
      const company = r.companyDisplay || "Unknown Company";
      if (!groups[company]) groups[company] = [];
      groups[company].push(r);
    });

    return groups;
  }, [filteredRows]);

  if (loading) {
    return <div className="p-6">Loading requests...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">License Requests</h1>

      {/* FILTERS */}
      <div className="flex gap-4 mb-4">

        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* STATUS FILTER */}
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* COMPANY FILTER */}
        <select
          className="border p-2 rounded"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="ALL">All Companies</option>
          {Object.keys(grouped).map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        <Button variant="contained" color="primary" onClick={exportExcel}>
          Export Excel
        </Button>

        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Export PDF
        </Button>
      </div>

      {/* GROUPED SECTIONS */}
      {Object.entries(grouped).map(([company, rows]) => {
        const isOpen = openGroups[company] ?? true;

        return (
          <div key={company} className="border rounded mb-4">

            {/* STICKY HEADER */}
            <div
              className="cursor-pointer bg-blue-100 px-4 py-2 font-semibold flex justify-between sticky top-0 z-10"
              onClick={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [company]: !isOpen,
                }))
              }
            >
              <span className="text-blue-900">
                {company} — {rows.length} requests
              </span>
              <span>{isOpen ? "▼" : "▶"}</span>
            </div>

            {isOpen && (
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
