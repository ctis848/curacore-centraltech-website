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

  if (loading)
    return (
      <p className="p-6 text-lg text-slate-600 animate-pulse">
        Loading machine history…
      </p>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Machine Activation History
      </h1>

      {/* FILTER BAR */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-4">

        <input
          type="text"
          placeholder="🔍 Search by machine ID, product, or license key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-lg shadow-sm w-full focus:ring-2 focus:ring-purple-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <select
            className="px-3 py-2 border rounded-lg shadow-sm"
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
            className="px-3 py-2 border rounded-lg shadow-sm"
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
            className="px-3 py-2 border rounded-lg shadow-sm"
          />

          <input
            type="text"
            placeholder="IP address"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm"
          />
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
                onClick={() => handleSort("machineId")}
              >
                Machine ID{getSortIcon("machineId")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">License Key</th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("productName")}
              >
                Product{getSortIcon("productName")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("activatedAt")}
              >
                Activated On{getSortIcon("activatedAt")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                Activation Age
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("deviceName")}
              >
                Device Name{getSortIcon("deviceName")}
              </th>

              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("ipAddress")}
              >
                IP Address{getSortIcon("ipAddress")}
              </th>

              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="border-b hover:bg-slate-50 transition">
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
              Activation Details
            </h2>

            <div className="space-y-2 text-slate-700">
              <p><strong>Machine ID:</strong> {selected.machineId}</p>
              <p><strong>License Key:</strong> {selected.licenseKey ?? "Unknown"}</p>
              <p><strong>Product:</strong> {selected.productName ?? "Unknown"}</p>
              <p><strong>Activated On:</strong> {new Date(selected.activatedAt).toLocaleString()}</p>
              <p><strong>Activation Age:</strong> {getActivationAge(selected.activatedAt)}</p>
              <p><strong>Device Name:</strong> {selected.deviceName || "Unknown"}</p>
              <p><strong>IP Address:</strong> {selected.ipAddress || "Unknown"}</p>
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
