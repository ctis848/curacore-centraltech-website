"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface License {
  id: string;
  productName: string | null;
  licenseKey: string;
  annualFeePaidUntil: string | null;
  status: string;
}

interface Billing {
  annual_fee: number | null;
}

export default function RenewAnnualPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [renewalDue, setRenewalDue] = useState(false);
  const [error, setError] = useState("");

  const BASE_PRICE = 10000; // ₦10,000
  const ANNUAL_RATE = 0.2; // 20%

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // Load all ACTIVE licenses for this user
    const { data: licenseData, error: licenseError } = await supabase
      .from("License")
      .select("id, productName, licenseKey, annualFeePaidUntil, status")
      .eq("userId", user.id)
      .eq("status", "ACTIVE");

    if (licenseError) {
      console.error(licenseError);
      setError("Unable to load licenses.");
      setLoading(false);
      return;
    }

    // Load billing (fixed annual fee)
    const { data: billingData } = await supabase
      .from("ClientBilling")
      .select("annual_fee")
      .eq("userId", user.id)
      .maybeSingle();

    const activeLicenses = licenseData || [];
    setLicenses(activeLicenses);
    setBilling(billingData || { annual_fee: null });

    // Renewal due if ANY license is expired or missing annualFeePaidUntil
    const today = new Date();
    const due = activeLicenses.some((lic) => {
      if (!lic.annualFeePaidUntil) return true;
      return new Date(lic.annualFeePaidUntil) < today;
    });

    setRenewalDue(due);
    setLoading(false);
  }

  // ---- Billing calculations ----
  const licenseCount = licenses.length;

  // Existing fixed annual fee from ClientBilling
  const fixedAnnualFee = billing?.annual_fee ?? 0;

  // Annual fee for ALL active licenses
  const newLicenseAnnualFee = Math.round(licenseCount * ANNUAL_RATE * BASE_PRICE);

  // Final total annual fee
  const totalAnnualFee = fixedAnnualFee + newLicenseAnnualFee;

  async function processPayment() {
    setProcessing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        alert("You must be logged in.");
        setProcessing(false);
        return;
      }

      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAnnualFee,
          type: "ANNUAL_RENEWAL",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        alert(data.error || "Unable to start payment.");
        setProcessing(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Unable to start payment.");
      setProcessing(false);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Renew Annual Payment</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white border rounded p-4 shadow-sm space-y-2">
        <p>
          <strong>Active Licenses:</strong> {licenseCount}
        </p>

        <p>
          <strong>Existing Client Annual Fee:</strong>{" "}
          <span className="font-semibold text-blue-700">
            ₦{fixedAnnualFee.toLocaleString()}
          </span>
        </p>

        <p>
          <strong>Total Annual Fee of All Active Licenses:</strong>{" "}
          <span className="font-semibold text-purple-700">
            ₦{newLicenseAnnualFee.toLocaleString()}
          </span>
        </p>

        <hr className="my-2" />

        <p>
          <strong>Total Annual Fee to Pay:</strong>{" "}
          <span className="font-semibold text-emerald-700 text-lg">
            ₦{totalAnnualFee.toLocaleString()}
          </span>
        </p>

        {!renewalDue && (
          <p className="text-blue-600 text-sm">
            Your annual renewal is not due yet.
          </p>
        )}
      </div>

      <button
        onClick={processPayment}
        disabled={processing || !renewalDue || totalAnnualFee <= 0}
        className={`mt-4 px-4 py-2 rounded text-white ${
          processing || !renewalDue || totalAnnualFee <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {processing ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}
