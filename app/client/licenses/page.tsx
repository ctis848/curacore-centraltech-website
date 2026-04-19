"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { License } from "@/types/client";
import Link from "next/link";

export default function LicensesPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setErrorMsg("You must be logged in to view licenses.");
        return;
      }

      const { data, error } = await supabase
        .from("License")
        .select(
          `
          id,
          userId,
          productName,
          licenseKey,
          status,
          createdAt,
          updatedAt,
          licenseRequestId,
          license_request:license_licenserequest_fkey (
            id,
            requestKey
          )
        `
        )
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("License fetch error:", error);
        setErrorMsg("Failed to load licenses.");
        return;
      }

      const normalized = (data || []).map((l: any) => ({
        ...l,
        license_request: Array.isArray(l.license_request)
          ? l.license_request[0] || null
          : l.license_request,
      }));

      setLicenses(normalized);
    } catch (err) {
      console.error("Unexpected license error:", err);
      setErrorMsg("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Your Licenses</h1>

        <Link
          href="/client/licenses/history"
          className="text-sm text-blue-600 hover:underline"
        >
          View Activation History →
        </Link>
      </div>

      {errorMsg && (
        <p className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {errorMsg}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && licenses.length === 0 && (
        <p className="text-slate-500">No licenses found.</p>
      )}

      {!loading && licenses.length > 0 && (
        <div className="space-y-3">
          {licenses.map((l) => (
            <div
              key={l.id}
              className="rounded-lg border bg-white p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">License ID: {l.id}</p>
                <p className="text-sm text-slate-600">
                  Created:{" "}
                  {l.createdAt
                    ? new Date(l.createdAt).toLocaleDateString()
                    : "—"}
                </p>

                {l.license_request?.requestKey && (
                  <p className="text-xs text-slate-500 mt-1">
                    Request Key:{" "}
                    <span className="font-mono">
                      {l.license_request.requestKey}
                    </span>
                  </p>
                )}
              </div>

              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  l.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : l.status === "EXPIRED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {l.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
