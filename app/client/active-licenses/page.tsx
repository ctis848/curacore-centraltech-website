"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { LicenseRow } from "@/types/admin";

export default function ClientActiveLicensesPage() {
  const supabase = supabaseBrowser();

  const [user, setUser] = useState<any>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [filtered, setFiltered] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState<keyof LicenseRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load user
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Auth load error:", error);
      setUser(data?.user || null);
    }
    loadUser();
  }, [supabase]);

  // Load licenses after user is available
  useEffect(() => {
    if (!user?.id) return;
    loadLicenses();
  }, [user]);

  async function loadLicenses() {
    setLoading(true);

    const { data, error } = await supabase
      .from("License")
      .select(`
        id,
        productName,
        licenseKey,
        status,
        userId,
        createdAt,
        expiresAt,
        annualFeePercent,
        annualFeePaidUntil
      `)
      .eq("userId", user.id)
      .in("status", ["ACTIVE", "PAID", "NOT_DUE"])
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Client License fetch error RAW:", error);
      console.error(
        "Client License fetch error JSON:",
        JSON.stringify(error, null, 2)
      );
      setLoading(false);
      return;
    }

    setLicenses(data || []);
    setFiltered(data || []);
    setLoading(false);
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
        (l.status ?? "").toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, licenses]);

  // Pagination
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Copy license key
  function copyLicenseKey(key: string | null) {
    navigator.clipboard.writeText(key ?? "");
    alert("License key copied");
  }

  // Download license file
  function downloadLicense(lic: LicenseRow) {
    const content = `PRODUCT=${lic.productName ?? ""}
LICENSE_KEY=${lic.licenseKey ?? ""}
USER=${lic.userId ?? ""}`;

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
      <h1 className="text-2xl font-semibold mb-4">Active Licenses</h1>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by product, key, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />
      </div>

      {loading && <p className="text-slate-500">Loading licenses…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No active licenses found.</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {[
                { label: "Product", field: "productName" },
                { label: "License Key", field: "licenseKey" },
                { label: "Status", field: "status" },
                { label: "Created", field: "createdAt" },
              ].map((col) => (
                <th
                  key={col.label}
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => {
                    setSortField(col.field as keyof LicenseRow);
                    setSortDir(sortDir === "asc" ? "desc" : "asc");
                  }}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((lic) => (
              <tr key={lic.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2">{lic.productName ?? "N/A"}</td>

                <td className="px-4 py-2 font-mono break-all">
                  {lic.licenseKey ?? "N/A"}
                </td>

                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      lic.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lic.status}
                  </span>
                </td>

                <td className="px-4 py-2">
                  {new Date(lic.createdAt).toLocaleString()}
                </td>

                <td className="px-4 py-2 space-x-3">
                  <a
                    href={`/client/licenses/${lic.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>

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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
