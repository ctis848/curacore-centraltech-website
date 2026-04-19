"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface License {
  id: string;
  productName: string | null;
  licenseKey: string;
  annualFeePaidUntil: string | null;
}

export default function RenewAnnualPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [renewalDue, setRenewalDue] = useState(false);
  const [error, setError] = useState("");

  const BASE_PRICE = 10000; // ₦10,000 per license
  const ANNUAL_RATE = 0.20; // 20%

  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("License")
      .select("id, productName, licenseKey, annualFeePaidUntil")
      .eq("userId", user.id)
      .eq("status", "ACTIVE");

    if (error) {
      console.error(error);
      setError("Unable to load licenses.");
      setLoading(false);
      return;
    }

    const today = new Date();
    const activeLicenses = data || [];

    // ⭐ Renewal is due if ANY license has expired annualFeePaidUntil
    const due = activeLicenses.some((lic) => {
      if (!lic.annualFeePaidUntil) return true;
      return new Date(lic.annualFeePaidUntil) < today;
    });

    setRenewalDue(due);
    setLicenses(activeLicenses);
    setLoading(false);
  }

  // ⭐ Total amount for ALL active licenses
  const totalAmount = Math.round(
    licenses.length * ANNUAL_RATE * BASE_PRICE
  );

  // ⭐ Paystack Redirect Payment
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

      console.log("Starting Paystack payment:", {
        licenseCount: licenses.length,
        totalAmount,
      });

      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId: "annual-fee", // generic reference
          amount: totalAmount,
        }),
      });

      const data = await res.json();
      console.log("Paystack init response:", data);

      if (!res.ok || !data.authorization_url) {
        alert(data.error || "Unable to start payment.");
        setProcessing(false);
        return;
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url;

    } catch (err) {
      console.error("Payment error:", err);
      alert("Unable to start payment.");
      setProcessing(false);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Renew Annual Payment</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded p-4 shadow-sm space-y-3">
        <p>
          <strong>Active Licenses:</strong> {licenses.length}
        </p>

        <p>
          <strong>Annual Rate:</strong> 20%
        </p>

        <p>
          <strong>Total Amount:</strong>{" "}
          <span className="font-semibold text-emerald-700">
            ₦{totalAmount.toLocaleString()}
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
        disabled={processing || !renewalDue}
        className={`mt-4 px-4 py-2 rounded text-white ${
          processing || !renewalDue
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {processing ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}
