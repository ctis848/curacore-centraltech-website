"use client";

import { useEffect, useMemo, useState } from "react";

type MachineHistory = {
  id: string;
  licenseKey: string;
  machineId: string;
  action: string;
  timestamp: string;
};

const PAGE_SIZE = 20;

export default function MachineHistoryPage() {
  const [history, setHistory] = useState<MachineHistory[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"machine" | "license" | "action" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [visibleCols, setVisibleCols] = useState({
    machineId: true,
    licenseKey: true,
    action: true,
    timestamp: true,
  });

  useEffect(() => {
    fetch("/api/client/machines/history", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setHistory(d.history || []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return history.filter((h) =>
      h.machineId.toLowerCase().includes(q) ||
      h.licenseKey.toLowerCase().includes(q) ||
      h.action.toLowerCase().includes(q)
    );
  }, [history, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      switch (sortBy) {
        case "machine":
          av = a.machineId.toLowerCase();
          bv = b.machineId.toLowerCase();
          break;
        case "license":
          av = a.licenseKey.toLowerCase();
          bv = b.licenseKey.toLowerCase();
          break;
        case "action":
          av = a.action.toLowerCase();
          bv = b.action.toLowerCase();
          break;
        case "date":
          av = new Date(a.timestamp).getTime();
          bv = new Date(b.timestamp).getTime();
          break;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCol = (key: keyof typeof visibleCols) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Machine History</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search machines..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-white shadow-sm"
        />

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-semibold mr-1">Columns:</span>
          {(
            [
              ["machineId", "Machine ID"],
              ["licenseKey", "License Key"],
              ["action", "Action"],
              ["timestamp", "Date"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={visibleCols[key]}
                onChange={() => toggleCol(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b">
            <tr>
              {visibleCols.machineId && <th className="px-4 py-2 text-left">Machine ID</th>}
              {visibleCols.licenseKey && <th className="px-4 py-2 text-left">License Key</th>}
              {visibleCols.action && <th className="px-4 py-2 text-left">Action</th>}
              {visibleCols.timestamp && <th className="px-4 py-2 text-left">Date</th>}
            </tr>
          </thead>

          <tbody>
            {paged.map((h) => (
              <tr key={h.id} className="border-b hover:bg-gray-50">
                {visibleCols.machineId && <td className="px-4 py-2">{h.machineId}</td>}
                {visibleCols.licenseKey && <td className="px-4 py-2">{h.licenseKey}</td>}
                {visibleCols.action && <td className="px-4 py-2">{h.action}</td>}
                {visibleCols.timestamp && (
                  <td className="px-4 py-2">
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2 text-sm">
        <span>
          Page {page} of {totalPages} — {sorted.length} records
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
