"use client";

import { useEffect, useState } from "react";

// -----------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------
interface CronLog {
  id: string;
  status: "success" | "failed";
  companies_notified: number;
  message: string;
  error?: string | null;
  created_at: string;
}

export default function CronLogsPage() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [filtered, setFiltered] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // -----------------------------------------------------
  // LOAD LOGS
  // -----------------------------------------------------
  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const res = await fetch("/api/admin/cron-logs");
    const json = await res.json();

    if (json.success) {
      setLogs(json.data);
      setFiltered(json.data);
    }

    setLoading(false);
  }

  // -----------------------------------------------------
  // APPLY FILTERS
  // -----------------------------------------------------
  useEffect(() => {
    let rows = [...logs];

    if (status !== "ALL") {
      rows = rows.filter((l) => l.status === status);
    }

    if (search) {
      rows = rows.filter(
        (l) =>
          l.message.toLowerCase().includes(search.toLowerCase()) ||
          (l.error || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFrom) {
      rows = rows.filter(
        (l) => new Date(l.created_at) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      rows = rows.filter(
        (l) => new Date(l.created_at) <= new Date(dateTo)
      );
    }

    setFiltered(rows);
  }, [logs, status, search, dateFrom, dateTo]);

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Cron Job Logs
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow">
        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="text"
          placeholder="Search message/error…"
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && <p className="text-slate-500">Loading logs…</p>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-600">No logs found.</p>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white shadow rounded-xl overflow-hidden border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Notified</th>
                <th className="p-3 border">Message</th>
                <th className="p-3 border">Error</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 border">
                    {new Date(log.created_at).toLocaleString("en-NG", {
                      timeZone: "Africa/Lagos",
                    })}
                  </td>

                  <td className="p-3 border">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.status === "success"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="p-3 border text-center">
                    {log.companies_notified}
                  </td>

                  <td className="p-3 border">{log.message}</td>

                  <td className="p-3 border text-red-600">
                    {log.error || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
