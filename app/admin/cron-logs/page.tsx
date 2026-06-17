"use client";

import { useEffect, useMemo, useState } from "react";

// -----------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------
interface CronLog {
  id: string;
  job_name: string;
  status: "success" | "failed" | "running" | "warning" | "info";
  message: string;
  error?: string | null;
  created_at: string;
  metadata?: any;
}

interface DashboardStats {
  lastRun: string | null;
  nextRun: string | null;
  remindersToday: number;
  failuresToday: number;
  perDayCounts: { date: string; count: number }[];
}

// -----------------------------------------------------
// CONSTANTS
// -----------------------------------------------------
const PAGE_SIZE = 20;
const AUTO_REFRESH_MS = 30_000;

// -----------------------------------------------------
// COMPONENT
// -----------------------------------------------------
export default function CronLogsPage() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [filtered, setFiltered] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<CronLog | null>(null);

  // -----------------------------------------------------
  // LOAD LOGS (with auto-refresh)
  // -----------------------------------------------------
  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  async function loadLogs() {
    try {
      const res = await fetch("/api/admin/cron-logs");
      const json = await res.json();

      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("Failed to load cron logs:", err);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------
  // FILTERING
  // -----------------------------------------------------
  useEffect(() => {
    let rows = [...logs];

    if (status !== "ALL") {
      rows = rows.filter((l) => l.status === status);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.message.toLowerCase().includes(term) ||
          (l.error || "").toLowerCase().includes(term) ||
          l.job_name.toLowerCase().includes(term)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      rows = rows.filter((l) => new Date(l.created_at) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      rows = rows.filter((l) => new Date(l.created_at) <= to);
    }

    setFiltered(rows);
    setPage(1);
  }, [logs, status, search, dateFrom, dateTo]);

  // -----------------------------------------------------
  // DASHBOARD STATS
  // -----------------------------------------------------
  const stats: DashboardStats = useMemo(() => {
    if (logs.length === 0) {
      return {
        lastRun: null,
        nextRun: null,
        remindersToday: 0,
        failuresToday: 0,
        perDayCounts: [],
      };
    }

    const sorted = [...logs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const lastRun = sorted[0]?.created_at || null;

    // Next run: assume cron runs every day at 00:05 Africa/Lagos
    const now = new Date();
    const next = new Date();
    next.setDate(now.getDate() + 1);
    next.setHours(0, 5, 0, 0);
    const nextRun = next.toISOString();

    const todayStr = new Date().toISOString().split("T")[0];

    let remindersToday = 0;
    let failuresToday = 0;

    const perDayMap: Record<string, number> = {};

    for (const log of logs) {
      const d = new Date(log.created_at).toISOString().split("T")[0];

      if (!perDayMap[d]) perDayMap[d] = 0;
      perDayMap[d] += 1;

      if (d === todayStr && log.job_name === "renewal_reminder") {
        if (log.status === "info" || log.status === "success") {
          remindersToday += 1;
        }
        if (log.status === "failed" || log.status === "warning") {
          failuresToday += 1;
        }
      }
    }

    const perDayCounts = Object.entries(perDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    return {
      lastRun,
      nextRun,
      remindersToday,
      failuresToday,
      perDayCounts,
    };
  }, [logs]);

  // -----------------------------------------------------
  // PAGINATION
  // -----------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // -----------------------------------------------------
  // STATUS BADGE COLORS
  // -----------------------------------------------------
  function statusColor(s: CronLog["status"]) {
    switch (s) {
      case "success":
        return "bg-green-200 text-green-800";
      case "failed":
        return "bg-red-200 text-red-800";
      case "warning":
        return "bg-yellow-200 text-yellow-800";
      case "running":
        return "bg-blue-200 text-blue-800";
      case "info":
        return "bg-purple-200 text-purple-800";
      default:
        return "bg-slate-200 text-slate-800";
    }
  }

  // -----------------------------------------------------
  // SIMPLE LINE GRAPH
  // -----------------------------------------------------
  function RemindersGraph() {
    const data = stats.perDayCounts;
    if (data.length === 0) {
      return (
        <div className="text-sm text-slate-500">
          No data yet for reminders per day.
        </div>
      );
    }

    const max = Math.max(...data.map((d) => d.count), 1);
    const width = 320;
    const height = 120;
    const padding = 20;

    const points = data.map((d, i) => {
      const x =
        padding +
        (i / Math.max(1, data.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        (d.count / max) * (height - padding * 2);
      return { x, y };
    });

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    return (
      <div className="space-y-2">
        <svg width={width} height={height} className="border rounded bg-slate-50">
          <path
            d={path}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={2}
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#4f46e5"
            />
          ))}
        </svg>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {data.map((d) => (
            <span key={d.date}>
              {d.date}: <strong>{d.count}</strong>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Cron Job Dashboard
        </h1>
        <p className="text-xs text-slate-500">
          Auto-refresh every 30 seconds
        </p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-slate-500">Last Run</p>
          <p className="text-sm font-semibold mt-1">
            {stats.lastRun
              ? new Date(stats.lastRun).toLocaleString("en-NG", {
                  timeZone: "Africa/Lagos",
                })
              : "—"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-slate-500">Next Run (assumed)</p>
          <p className="text-sm font-semibold mt-1">
            {stats.nextRun
              ? new Date(stats.nextRun).toLocaleString("en-NG", {
                  timeZone: "Africa/Lagos",
                })
              : "—"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-slate-500">Reminders Sent Today</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.remindersToday}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-slate-500">Failures Today</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.failuresToday}
          </p>
        </div>
      </div>

      {/* GRAPH */}
      <div className="bg-white rounded-xl shadow p-6 border space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Reminders Per Day
        </h2>
        <RemindersGraph />
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-white p-6 rounded-xl shadow">
        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="warning">Warning</option>
          <option value="running">Running</option>
          <option value="info">Info</option>
        </select>

        <input
          type="text"
          placeholder="Search message, job name, or error…"
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

        <button
          onClick={loadLogs}
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-slate-500">Loading logs…</p>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-600">No logs found.</p>
      )}

      {/* TABLE + PAGINATION */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl overflow-hidden border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Job</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Message</th>
                  <th className="p-3 border">Error</th>
                  <th className="p-3 border">Details</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 border">
                      {new Date(log.created_at).toLocaleString("en-NG", {
                        timeZone: "Africa/Lagos",
                      })}
                    </td>

                    <td className="p-3 border font-semibold">
                      {log.job_name}
                    </td>

                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="p-3 border">{log.message}</td>

                    <td className="p-3 border text-red-600">
                      {log.error || "—"}
                    </td>

                    <td className="p-3 border text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded border ${
                  page === 1
                    ? "text-slate-400 border-slate-200"
                    : "text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className={`px-3 py-1 rounded border ${
                  page === totalPages
                    ? "text-slate-400 border-slate-200"
                    : "text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Log Details
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-500 hover:text-slate-800 text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">ID:</span> {selectedLog.id}
              </p>
              <p>
                <span className="font-semibold">Job:</span>{" "}
                {selectedLog.job_name}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(
                    selectedLog.status
                  )}`}
                >
                  {selectedLog.status}
                </span>
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedLog.created_at).toLocaleString("en-NG", {
                  timeZone: "Africa/Lagos",
                })}
              </p>
              <p>
                <span className="font-semibold">Message:</span>{" "}
                {selectedLog.message}
              </p>
              <p>
                <span className="font-semibold">Error:</span>{" "}
                {selectedLog.error || "—"}
              </p>
              {selectedLog.metadata && (
                <div>
                  <p className="font-semibold">Metadata:</p>
                  <pre className="bg-slate-100 rounded p-2 text-xs overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
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