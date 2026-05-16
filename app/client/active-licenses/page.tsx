"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type LicenseRow = {
  id: string;
  productName: string | null;
  licenseKey: string | null;
  status: string;
  user_id: string;
  created_at: string;
  expires_at: string | null;
  annualFeePercent: number | null;
  annualFeePaidUntil: string | null;
  requestKey?: string | null;
};

export default function ClientLicensesPage() {
  const supabase = supabaseBrowser();

  const [user, setUser] = useState<any>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [filtered, setFiltered] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  const [sortField, setSortField] = useState<keyof LicenseRow>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, [supabase]);

  // Load licenses after user is available
  useEffect(() => {
    if (!user?.id) return;
    loadLicenses();
  }, [user, activeTab]);

  async function loadLicenses() {
    setLoading(true);

    // ACTIVE TAB → Load from License table
    if (activeTab === "ACTIVE") {
      const { data } = await supabase
        .from("License")
        .select(`
          id,
          productName,
          licenseKey,
          status,
          user_id,
          created_at,
          expires_at,
          annualFeePercent,
          annualFeePaidUntil,
          licenserequestid
        `)
        .eq("user_id", user.id)
        .in("status", ["ACTIVE", "PAID", "NOT_DUE"])
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((l) => ({
        id: l.id,
        productName: l.productName,
        licenseKey: l.licenseKey,
        status: l.status,
        user_id: l.user_id,
        created_at: l.created_at,
        expires_at: l.expires_at,
        annualFeePercent: l.annualFeePercent,
        annualFeePaidUntil: l.annualFeePaidUntil,
        requestKey: null,
      }));

      setLicenses(mapped);
      setFiltered(mapped);
      setLoading(false);
      return;
    }

    // PENDING TAB → Load from LicenseRequest table
    if (activeTab === "PENDING") {
      const { data: reqs } = await supabase
        .from("LicenseRequest")
        .select(`
          id,
          productName,
          requestKey,
          status,
          userId,
          requestedAt
        `)
        .eq("userId", user.id)
        .eq("status", "PENDING")
        .order("requestedAt", { ascending: false });

      const pendingMapped = (reqs || []).map((r) => ({
        id: r.id,
        productName: r.productName,
        licenseKey: null,
        status: "PENDING",
        user_id: r.userId,
        created_at: r.requestedAt,
        expires_at: null,
        annualFeePercent: null,
        annualFeePaidUntil: null,
        requestKey: r.requestKey,
      }));

      setLicenses(pendingMapped);
      setFiltered(pendingMapped);
      setLoading(false);
    }
  }

  // Sorting
  useEffect(() => {
    const sorted = [...licenses].sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(sorted);
  }, [sortField, sortDir, licenses]);

  // Search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = licenses.filter((l) => {
      return (
        (l.productName ?? "").toLowerCase().includes(s) ||
        (l.licenseKey ?? "").toLowerCase().includes(s) ||
        (l.status ?? "").toLowerCase().includes(s) ||
        (l.requestKey ?? "").toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, licenses]);

  // Pagination
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  function copyLicenseKey(key: string | null) {
    navigator.clipboard.writeText(key ?? "");
    alert("License key copied");
  }

  function downloadLicense(lic: LicenseRow) {
    const content = `PRODUCT=${lic.productName ?? ""}
LICENSE_KEY=${lic.licenseKey ?? ""}
USER=${lic.user_id ?? ""}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${lic.productName ?? "license"}-license.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        {activeTab === "ACTIVE" ? "Active Licenses" : "Pending License Requests"}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded ${
            activeTab === "ACTIVE"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          Active Licenses
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded ${
            activeTab === "PENDING"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          Pending Requests
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by product, key, request key, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />
      </div>

      {loading && <p className="text-slate-500">Loading licenses…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">
          {activeTab === "ACTIVE"
            ? "No active licenses found."
            : "No pending requests found."}
        </p>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">Product</th>

                {activeTab === "PENDING" && (
                  <th className="px-4 py-2">Request Key</th>
                )}

                <th className="px-4 py-2">License Key</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((lic) => (
                <tr key={lic.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">{lic.productName ?? "N/A"}</td>

                  {activeTab === "PENDING" && (
                    <td className="px-4 py-2 font-mono break-all">
                      {lic.requestKey ?? "N/A"}
                    </td>
                  )}

                  <td className="px-4 py-2 font-mono break-all">
                    {lic.licenseKey ?? "N/A"}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        lic.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : lic.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {lic.status}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    {new Date(lic.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-2 space-x-3">
                    <a
                      href={`/client/licenses/${lic.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>

                    {lic.licenseKey && (
                      <>
                        <button
                          onClick={() => copyLicenseKey(lic.licenseKey)}
                          className="text-indigo-600 hover:underline"
                        >
                          Copy
                        </button>

                          <button
                          onClick={() => downloadLicense(lic)}
                          className="text-green-600 hover:underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
