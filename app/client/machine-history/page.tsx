"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MachineActivation {
  id: string;
  licenseId: string;
  machineId: string;
  activatedAt: string;
  ipAddress: string | null;
  deviceName: string | null;
  licenseKey: string | null;
  productName: string | null;
}

type SortColumn =
  | "machineId"
  | "activatedAt"
  | "productName"
  | "deviceName"
  | "ipAddress";
type SortDirection = "asc" | "desc";

export default function MachineHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<MachineActivation[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [productFilter, setProductFilter] = useState("ALL");
  const [licenseFilter, setLicenseFilter] = useState("ALL");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<SortColumn>("activatedAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<MachineActivation | null>(null);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data: licenseRows } = await supabase
      .from("License")
      .select("id, licenseKey, productName")
      .eq("userId", user.id);

    const licenseIds = licenseRows?.map((l) => l.id) || [];

    if (licenseIds.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("MachineActivation")
      .select("*")
      .in("licenseId", licenseIds);

    if (error) console.error(error);

    const formatted = (data || []).map((row: any) => {
      const lic = licenseRows?.find((l) => l.id === row.licenseId);
      return {
        ...row,
        licenseKey: lic?.licenseKey ?? "",
        productName: lic?.productName ?? "",
      };
    });

    setRows(formatted);
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
    let list = [...rows];

    const s = search.toLowerCase();

    list = list.filter((r) => {
      const matchesSearch =
        r.machineId.toLowerCase().includes(s) ||
        (r.licenseKey ?? "").toLowerCase().includes(s) ||
        (r.productName ?? "").toLowerCase().includes(s);

      const matchesProduct =
        productFilter === "ALL" || r.productName === productFilter;

      const matchesLicense =
        licenseFilter === "ALL" || r.licenseKey === licenseFilter;

      const matchesDevice =
        (r.deviceName ?? "").toLowerCase().includes(deviceFilter.toLowerCase());

      const matchesIp =
        (r.ipAddress ?? "").toLowerCase().includes(ipFilter.toLowerCase());

      const matchesDate = applyDateFilter(r.activatedAt);

      return (
        matchesSearch &&
        matchesProduct &&
        matchesLicense &&
        matchesDevice &&
        matchesIp &&
        matchesDate
      );
    });

    list.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    rows,
    search,
    productFilter,
    licenseFilter,
    deviceFilter,
    ipFilter,
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
      "License Key",
      "Product",
      "Activated On",
      "Activation Age",
      "Device Name",
      "IP Address",
    ];

    const rowsCSV = processed.map((r) => [
      r.machineId,
      r.licenseKey,
      r.productName,
      new Date(r.activatedAt).toLocaleString(),
      getActivationAge(r.activatedAt),
      r.deviceName || "",
      r.ipAddress || "",
    ]);

    const csv =
      [headers.join(","), ...rowsCSV.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "machine_history.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      processed.map((r) => ({
        MachineID: r.machineId,
        LicenseKey: r.licenseKey,
        Product: r.productName,
        ActivatedOn: r.activatedAt,
        ActivationAge: getActivationAge(r.activatedAt),
        DeviceName: r.deviceName,
        IPAddress: r.ipAddress,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Machine History");
    XLSX.writeFile(workbook, "machine_history.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Machine Activation History", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Machine ID",
          "License Key",
          "Product",
          "Activated On",
          "Device",
          "IP",
        ],
      ],
      body: processed.map((r) => [
        r.machineId,
        r.licenseKey,
        r.productName,
        r.activatedAt,
        r.deviceName ?? "",
        r.ipAddress ?? "",
      ]),
    });

    doc.save("machine_history.pdf");
  }

  const uniqueProducts = Array.from(
    new Set(rows.map((r) => r.productName).filter(Boolean))
  );

  const uniqueLicenses = Array.from(
    new Set(rows.map((r) => r.licenseKey).filter(Boolean))
  );

  if (loading) return <p className="p-4">Loading machine history...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Machine Activation History</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by machine ID, product, or license key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded shadow-sm min-w-[200px]"
        />

        <select
          className="px-3 py-2 border rounded"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="ALL">All Products</option>
          {uniqueProducts.map((p) => (
            <option key={p} value={p ?? ""}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded"
          value={licenseFilter}
          onChange={(e) => setLicenseFilter(e.target.value)}
        >
          <option value="ALL">All License Keys</option>
          {uniqueLicenses.map((l) => (
            <option key={l} value={l ?? ""}>
              {l}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Device name"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="px-3 py-2 border rounded w-40"
        />

        <input
          type="text"
          placeholder="IP address"
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
          className="px-3 py-2 border rounded w-40"
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
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("machineId")}
              >
                Machine ID{getSortIcon("machineId")}
              </th>

              <th className="px-4 py-3 text-left">License Key</th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("productName")}
              >
                Product{getSortIcon("productName")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("activatedAt")}
              >
                Activated On{getSortIcon("activatedAt")}
              </th>

              <th className="px-4 py-3 text-left">Activation Age</th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("deviceName")}
              >
                Device Name{getSortIcon("deviceName")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("ipAddress")}
              >
                IP Address{getSortIcon("ipAddress")}
              </th>

              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="border-b hover:bg-slate-100">
                <td className="px-4 py-3 font-mono break-all">{row.machineId}</td>
                <td className="px-4 py-3 font-mono break-all">{row.licenseKey}</td>
                <td className="px-4 py-3">{row.productName}</td>
                <td className="px-4 py-3">
                  {new Date(row.activatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-blue-700 font-semibold">
                  {getActivationAge(row.activatedAt)}
                </td>
                <td className="px-4 py-3">{row.deviceName || "Unknown"}</td>
                <td className="px-4 py-3">{row.ipAddress || "Unknown"}</td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(row)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
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

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Activation Details</h2>

            <p><strong>Machine ID:</strong> {selected.machineId}</p>
            <p><strong>License Key:</strong> {selected.licenseKey ?? "Unknown"}</p>
            <p><strong>Product:</strong> {selected.productName ?? "Unknown"}</p>
            <p><strong>Activated On:</strong> {new Date(selected.activatedAt).toLocaleString()}</p>
            <p><strong>Activation Age:</strong> {getActivationAge(selected.activatedAt)}</p>
            <p><strong>Device Name:</strong> {selected.deviceName || "Unknown"}</p>
            <p><strong>IP Address:</strong> {selected.ipAddress || "Unknown"}</p>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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
