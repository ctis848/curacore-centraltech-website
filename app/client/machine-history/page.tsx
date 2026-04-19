"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

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

type SortColumn = "machineId" | "activatedAt" | "productName";
type SortDirection = "asc" | "desc";

export default function MachineHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<MachineActivation[]>([]);
  const [filtered, setFiltered] = useState<MachineActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState<SortColumn>("activatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selected, setSelected] = useState<MachineActivation | null>(null);

  // ⭐ Activation Age
  function getActivationAge(date: string) {
    const now = new Date();
    const act = new Date(date);
    const diff = now.getTime() - act.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  // ⭐ Load Data
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRows([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      // Get all license IDs for this user
      const { data: licenseRows } = await supabase
        .from("License")
        .select("id, licenseKey, productName")
        .eq("userId", user.id);

      const licenseIds = licenseRows?.map((l) => l.id) || [];

      if (licenseIds.length === 0) {
        setRows([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      // Get machine activations
      const { data, error } = await supabase
        .from("MachineActivation")
        .select("*")
        .in("licenseId", licenseIds);

      if (error) console.error(error);

      // Merge license info
      const formatted = (data || []).map((row: any) => {
        const lic = licenseRows?.find((l) => l.id === row.licenseId);
        return {
          ...row,
          licenseKey: lic?.licenseKey || null,
          productName: lic?.productName || null,
        };
      });

      setRows(formatted);
      setFiltered(formatted);
      setLoading(false);
    }

    loadData();
  }, []);

  // 🔍 Search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = rows.filter((r) => {
      return (
        r.machineId.toLowerCase().includes(s) ||
        r.licenseKey?.toLowerCase().includes(s) ||
        r.productName?.toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, rows]);

  // ↕️ Sorting
  function sortData(column: SortColumn) {
    let direction: SortDirection = "asc";

    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
    }

    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...filtered].sort((a, b) => {
      const valA = (a[column] || "").toString().toLowerCase();
      const valB = (b[column] || "").toString().toLowerCase();

      if (direction === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    setFiltered(sorted);
  }

  const sortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // 📄 Export CSV
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

    const rowsCSV = filtered.map((r) => [
      r.machineId,
      r.licenseKey,
      r.productName,
      new Date(r.activatedAt).toLocaleString(),
      getActivationAge(r.activatedAt),
      r.deviceName || "",
      r.ipAddress || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rowsCSV].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "machine_history.csv";
    link.click();
  }

  if (loading) return <p className="p-4">Loading machine history...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Machine Activation History</h1>

      {/* Search + Export */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by machine ID, product, or license key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded shadow-sm"
        />

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("machineId")}
              >
                Machine ID {sortArrow("machineId")}
              </th>

              <th className="px-4 py-3 text-left">License Key</th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("productName")}
              >
                Product {sortArrow("productName")}
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => sortData("activatedAt")}
              >
                Activated On {sortArrow("activatedAt")}
              </th>

              <th className="px-4 py-3 text-left">Activation Age</th>
              <th className="px-4 py-3 text-left">Device Name</th>
              <th className="px-4 py-3 text-left">IP Address</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => (
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

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Activation Details</h2>

            <p><strong>Machine ID:</strong> {selected.machineId}</p>
            <p><strong>License Key:</strong> {selected.licenseKey}</p>
            <p><strong>Product:</strong> {selected.productName}</p>
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
