"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

// Existing License table type
interface LicenseItem {
  id: string;
  userId: string;
  productName: string;
  licenseKey: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  licenseRequestId: string | null;
  license_request: {
    id: string;
    requestkey: string;
  } | null;
}

// Client table type
interface ClientRecord {
  id: number;
  email: string;
  companyName: string;
  totalLicenses: number;
}

// LicensePurchases table type
interface PurchaseRecord {
  id: number;
  plan: string;
  quantity: number;
  amount: number;
  reference: string;
  created_at: string;
}

export default function LicensesPage() {
  const supabase = supabaseBrowser();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extraLicenses, setExtraLicenses] = useState(1);
  const [updatingLimit, setUpdatingLimit] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Get logged-in user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setErrorMsg("You must be logged in to view licenses.");
        return;
      }

      // 1️⃣ Load Client record
      const { data: clientData } = await supabase
        .from("Clients")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (clientData) {
        setClient({
          id: clientData.id,
          email: clientData.email,
          companyName: clientData.companyName,
          totalLicenses: clientData.totalLicenses,
        });
      }

      // 2️⃣ Load LicensePurchases history
      const { data: purchaseData } = await supabase
        .from("LicensePurchases")
        .select("*")
        .eq("clientId", clientData?.id)
        .order("created_at", { ascending: false });

      setPurchases(purchaseData || []);

      // 3️⃣ Load per-device License table
      const { data: licenseData, error: licenseError } = await supabase
        .from("License")
        .select(
          `
          id,
          userid,
          productname,
          licensekey,
          status,
          createdat,
          updatedat,
          licenserequestid,
          license_request:license_licenserequestid_fkey (
            id,
            requestkey
          )
        `
        )
        .eq("userid", user.id)
        .order("createdat", { ascending: false });

      if (licenseError) {
        console.error("License fetch error:", licenseError);
        setErrorMsg("Failed to load licenses.");
        return;
      }

      const normalized: LicenseItem[] = (licenseData || []).map((l: any) => ({
        id: l.id,
        userId: l.userid,
        productName: l.productname,
        licenseKey: l.licensekey,
        status: l.status,
        createdAt: l.createdat,
        updatedAt: l.updatedat,
        licenseRequestId: l.licenserequestid,
        license_request: Array.isArray(l.license_request)
          ? l.license_request[0] || null
          : l.license_request,
      }));

      setLicenses(normalized);
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 4️⃣ Increase license limit
  async function handleIncreaseLimit() {
    if (!client) return;

    setUpdatingLimit(true);

    await fetch("/api/client/licenses/increase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extraLicenses }),
    });

    setUpdatingLimit(false);
    setExtraLicenses(1);
    loadData();
  }

  return (
    <div className="space-y-10 pt-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          Your Licenses & Limits
        </h1>

        <Link
          href="/client/licenses/history"
          className="text-sm text-blue-600 hover:underline"
        >
          View Activation History →
        </Link>
      </div>

      {/* Errors */}
      {errorMsg && (
        <p className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {errorMsg}
        </p>
      )}

      {/* Loading skeleton */}
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

      {/* Client License Limit */}
      {!loading && client && (
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            License Limit Overview
          </h2>

          <p className="text-slate-700">
            <strong>Company:</strong> {client.companyName}
          </p>

          <p className="text-slate-700">
            <strong>Total Licenses Allowed:</strong>{" "}
            <span className="text-emerald-700 font-bold">
              {client.totalLicenses}
            </span>
          </p>

          <div className="flex items-end gap-3 pt-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Increase By
              </label>
              <input
                type="number"
                min={1}
                value={extraLicenses}
                onChange={(e) =>
                  setExtraLicenses(Math.max(1, Number(e.target.value) || 1))
                }
                className="border rounded-lg px-3 py-2 w-28"
              />
            </div>

            <button
              onClick={handleIncreaseLimit}
              disabled={updatingLimit}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {updatingLimit ? "Updating..." : "Update Limit"}
            </button>
          </div>
        </div>
      )}

      {/* License Purchases */}
      {!loading && purchases.length > 0 && (
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            License Purchases
          </h2>

          {purchases.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-slate-700">
                  Plan: <strong>{p.plan}</strong> • Qty:{" "}
                  <strong>{p.quantity}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Ref: {p.reference} •{" "}
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>

              <p className="text-sm font-semibold text-emerald-700">
                ₦{p.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Per-device License Keys */}
      {!loading && licenses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Device License Keys
          </h2>

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

                {l.license_request?.requestkey && (
                  <p className="text-xs text-slate-500 mt-1">
                    Request Key:{" "}
                    <span className="font-mono">
                      {l.license_request.requestkey}
                    </span>
                  </p>
                )}

                <p className="text-xs text-slate-500 mt-1">
                  License Key:{" "}
                  <span className="font-mono">{l.licenseKey}</span>
                </p>
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
