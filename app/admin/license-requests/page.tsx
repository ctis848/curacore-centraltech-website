"use client";

import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

type LicenseRequest = {
  id: string;
  emailDisplay: string;
  companyDisplay: string;
  productName: string;
  requestKey: string;
  licenseKey?: string | null;
  status: string;
  sentAt?: string | null;
};

export default function LicenseRequestListPage() {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [licenseInputs, setLicenseInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadRequests() {
      const res = await fetch("/api/admin/license-requests", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        const normalized = data.map((r: any) => ({
          ...r,
          emailDisplay: r.userEmail || r.email || "—",
          companyDisplay: r.companyname || r.companyName || "—",
          licenseKey: r.licenseKey || "",
          sentAt: r.sentAt || null,
        }));

        setRequests(normalized);
      }

      setLoading(false);
    }

    loadRequests();
  }, []);

  function updateLicenseInput(id: string, value: string) {
    setLicenseInputs((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSaveLicense(row: LicenseRequest) {
    const licenseKey = licenseInputs[row.id] ?? "";

    if (!licenseKey.trim()) {
      alert("Please paste a license key first.");
      return;
    }

    const payload = {
      id: row.id,
      licenseKey,
    };

    const res = await fetch("/api/admin/license-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("License saved!");

      setRequests((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                licenseKey,
                status: "APPROVED",
                sentAt: new Date().toLocaleString(),
              }
            : r
        )
      );

      setLicenseInputs((prev) => ({ ...prev, [row.id]: "" }));
    } else {
      alert("Failed to save license.");
    }
  }

  async function handleReject(id: string) {
    const res = await fetch(`/api/admin/license-requests/${id}/reject`, {
      method: "POST",
    });

    if (!res.ok) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" } : r
      )
    );
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

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
        companyFilter === "ALL" || r.companyDisplay === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [search, statusFilter, companyFilter, requests]);

  const columns = [
    { field: "emailDisplay", headerName: "Email", flex: 1, minWidth: 150 },
    { field: "companyDisplay", headerName: "Company", flex: 1, minWidth: 150 },
    { field: "productName", headerName: "Product", flex: 1, minWidth: 120 },

    {
      field: "requestKey",
      headerName: "Request Key",
      flex: 2,
      minWidth: 220,
      renderCell: (params: any) => (
        <div className="flex flex-col gap-1 w-full">
          <span className="font-mono text-xs break-all">{params.value}</span>
          <button
            onClick={() => copyToClipboard(params.value)}
            className="text-blue-600 underline text-xs"
          >
            Copy
          </button>
        </div>
      ),
    },

    {
      field: "licenseKey",
      headerName: "License Key",
      flex: 2,
      minWidth: 220,
      renderCell: (params: any) => (
        <span className="font-mono text-xs text-green-700 break-all">
          {params.value || "—"}
        </span>
      ),
    },

    {
      field: "sentAt",
      headerName: "Sent At",
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) =>
        params.value ? (
          <span className="text-green-700 text-xs">{params.value}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
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
      flex: 0,
      minWidth: 220,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const id = params.row.id;

        return (
          <div className="flex flex-col gap-2 w-full min-h-[100px]">
            <textarea
              className="border p-2 rounded w-full text-xs bg-slate-50 focus:ring-2 focus:ring-purple-400"
              rows={3}
              placeholder="Paste license key..."
              value={licenseInputs[id] ?? ""}
              onChange={(e) => updateLicenseInput(id, e.target.value)}
            />

            <button
              onClick={() => handleSaveLicense(params.row)}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded shadow hover:brightness-110"
            >
              Save
            </button>

            <button
              onClick={() => handleReject(id)}
              className="text-red-600 underline text-xs disabled:opacity-50"
              disabled={params.row.status === "REJECTED"}
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

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
    return (
      <div className="p-6 text-slate-600 text-sm">
        Loading requests…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        License Requests
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">

        <input
          type="text"
          placeholder="Search..."
          className="border p-3 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-purple-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
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

        <Button variant="contained" color="primary">
          Export Excel
        </Button>

        <Button variant="contained" color="secondary">
          Export PDF
        </Button>
      </div>

      {/* GROUPED TABLES */}
      {Object.entries(grouped).map(([company, rows]) => {
        const isOpen = openGroups[company] ?? true;

        return (
          <div key={company} className="border rounded-2xl shadow bg-white mb-6">
            <div
              className="cursor-pointer bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-3 font-semibold flex justify-between items-center sticky top-0 z-10 rounded-t-2xl"
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
              <span className="text-blue-900 font-bold">
                {isOpen ? "▼" : "▶"}
              </span>
            </div>

            {isOpen && (
              <div style={{ height: 450, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[5, 10, 20]}
                  disableRowSelectionOnClick
                  getRowHeight={() => "auto"}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
