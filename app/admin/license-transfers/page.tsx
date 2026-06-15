"use client";

import React, { Fragment, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type LicenseRequest = {
  id: string;
  productName: string | null;
  requestKey: string | null;
  licenseKey: string | null;
  status: string;
  notes: string | null;
  requestedAt: string | null;
  processedAt: string | null;
  processedBy: string | null;
  userEmail: string | null;
  companyName: string | null;
};

type SortableField = keyof LicenseRequest;
type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminLicenseTransfersPage() {
  const supabase = supabaseBrowser();

  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<LicenseRequest | null>(null);
  const [newLicenseKey, setNewLicenseKey] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [sortField, setSortField] = useState<SortableField>("requestedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [companyOpen, setCompanyOpen] = useState<Record<string, boolean>>({});
  const [dateOpen, setDateOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("LicenseRequest")
      .select("*")
      .order("requestedAt", { ascending: false });

    if (!error && data) {
      setRequests(data as LicenseRequest[]);
    }

    setLoading(false);
  }

  function sortRequests(data: LicenseRequest[]) {
    return [...data].sort((a, b) => {
      const A = a[sortField] ?? "";
      const B = b[sortField] ?? "";

      if (A < B) return sortDirection === "asc" ? -1 : 1;
      if (A > B) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  function filterRequests(data: LicenseRequest[]) {
    return data.filter((req) => {
      const term = search.toLowerCase();

      const matchesSearch =
        (req.productName ?? "").toLowerCase().includes(term) ||
        (req.userEmail ?? "").toLowerCase().includes(term) ||
        (req.companyName ?? "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" ? true : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  function groupByCompany(data: LicenseRequest[]) {
    const groups: Record<string, LicenseRequest[]> = {};

    data.forEach((item) => {
      const company = item.companyName || "Unknown Company";
      if (!groups[company]) groups[company] = [];
      groups[company].push(item);
    });

    return groups;
  }

  function groupByDate(items: LicenseRequest[]) {
    const groups: Record<string, LicenseRequest[]> = {};

    items.forEach((item) => {
      const date = item.requestedAt
        ? new Date(item.requestedAt).toISOString().split("T")[0]
        : "Unknown Date";

      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    return groups;
  }

  async function approveRequest() {
    if (!selected) return;

    setMsg("");
    setError("");

    if (!newLicenseKey.trim()) {
      setError("New license key is required.");
      return;
    }

    const res = await fetch("/api/admin/licenses/approve-transfer", {
      method: "POST",
      body: JSON.stringify({
        requestId: selected.id,
        newLicenseKey: newLicenseKey.trim(),
        notes: adminNotes.trim(),
      }),
    });

    const json = await res.json();

    if (!json.success) {
      setError(json.message || "Unable to approve request.");
      return;
    }

    setMsg("License approved and updated successfully.");
    setSelected(null);
    setNewLicenseKey("");
    setAdminNotes("");
    loadRequests();
  }

  async function rejectRequest() {
    if (!selected) return;

    setMsg("");
    setError("");

    const res = await fetch("/api/admin/licenses/reject-transfer", {
      method: "POST",
      body: JSON.stringify({
        requestId: selected.id,
        notes: adminNotes.trim(),
      }),
    });

    const json = await res.json();

    if (!json.success) {
      setError(json.message || "Unable to reject request.");
      return;
    }

    setMsg("Request rejected successfully.");
    setSelected(null);
    setAdminNotes("");
    loadRequests();
  }

  const processed = sortRequests(filterRequests(requests));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* PAGE TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
        Admin — License-Transfers
      </h1>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow border">
        <input
          type="text"
          placeholder="Search by company, email, product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-72"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-left font-semibold">User Email</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Requested</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupByCompany(processed)).map(
              ([company, companyItems]) => (
                <Fragment key={`company-${company}`}>
                  {/* COMPANY HEADER */}
                  <tr
                    className="bg-slate-300 cursor-pointer"
                    onClick={() =>
                      setCompanyOpen((prev) => ({
                        ...prev,
                        [company]: !prev[company],
                      }))
                    }
                  >
                    <td colSpan={5} className="px-4 py-2 font-bold text-slate-800">
                      {company} {companyOpen[company] ? "▼" : "▶"}
                    </td>
                  </tr>

                  {/* COMPANY CONTENT */}
                  {companyOpen[company] &&
                    Object.entries(groupByDate(companyItems)).map(
                      ([date, dateItems]) => (
                        <Fragment key={`date-${company}-${date}`}>
                          {/* DATE HEADER */}
                          <tr
                            className="bg-blue-100 cursor-pointer"
                            onClick={() =>
                              setDateOpen((prev) => ({
                                ...prev,
                                [`${company}-${date}`]:
                                  !prev[`${company}-${date}`],
                              }))
                            }
                          >
                            <td
                              colSpan={5}
                              className="px-4 py-2 font-semibold text-blue-800"
                            >
                              {date === "Unknown Date"
                                ? "Unknown Date"
                                : new Date(date).toLocaleDateString()}{" "}
                              {dateOpen[`${company}-${date}`] ? "▼" : "▶"}
                            </td>
                          </tr>

                          {/* DATE CONTENT */}
                          {dateOpen[`${company}-${date}`] &&
                            dateItems.map((req) => (
                              <tr
                                key={req.id}
                                className={`border-t hover:bg-slate-50 transition ${
                                  req.status === "APPROVED"
                                    ? "bg-green-50"
                                    : req.status === "PENDING"
                                    ? "bg-yellow-50"
                                    : "bg-red-50"
                                }`}
                              >
                                <td className="px-4 py-3">
                                  {req.productName ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                  {req.userEmail ?? "—"}
                                </td>

                                <td className="px-4 py-3 font-bold">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      req.status === "APPROVED"
                                        ? "bg-green-200 text-green-800"
                                        : req.status === "PENDING"
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-red-200 text-red-800"
                                    }`}
                                  >
                                    {req.status}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  {req.requestedAt
                                    ? new Date(
                                        req.requestedAt
                                      ).toLocaleString()
                                    : "—"}
                                </td>

                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => setSelected(req)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </Fragment>
                      )
                    )}
                </Fragment>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full space-y-6 border border-slate-300">
            <h2 className="text-2xl font-bold text-slate-800">
              Review Transfer Request
            </h2>

            <div className="space-y-2">
              <p>
                <strong>Product:</strong> {selected.productName}
              </p>
              <p>
                <strong>User Email:</strong> {selected.userEmail}
              </p>
              <p>
                <strong>Company:</strong> {selected.companyName}
              </p>
              <p>
                <strong>Old License Key:</strong>{" "}
                <span className="font-mono">{selected.licenseKey}</span>
              </p>
              <p>
                <strong>New Request-Key:</strong>{" "}
                <span className="font-mono">{selected.requestKey}</span>
              </p>
              <p>
                <strong>Status:</strong> {selected.status}
              </p>
              <p>
                <strong>Requested At:</strong> {selected.requestedAt}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                New License Key (paste from generator)
              </label>
              <textarea
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 font-mono"
                rows={3}
                value={newLicenseKey}
                onChange={(e) => setNewLicenseKey(e.target.value)}
                placeholder="Paste new license key here..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Admin Notes
              </label>
              <textarea
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes for this request..."
              />
            </div>

            {error && (
              <p className="text-red-600 font-semibold bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            {msg && (
              <p className="text-green-700 font-semibold bg-green-50 p-3 rounded-lg border border-green-200">
                {msg}
              </p>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-3 bg-slate-300 rounded-lg hover:bg-slate-400"
              >
                Close
              </button>

              <div className="flex gap-3">
                <button
                  onClick={rejectRequest}
                  className="px-5 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                >
                  Reject
                </button>

                <button
                  onClick={approveRequest}
                  className="px-5 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
