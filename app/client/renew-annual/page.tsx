"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Company {
  id: string;
  name: string;
  annual_price: number;
  renewal_date: string;
  license_count: number;
}

export default function RenewAnnualPage() {
  const supabase = supabaseBrowser();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanyData();
  }, []);

  async function loadCompanyData() {
    setLoading(true);
    setError("");

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // 1️⃣ Get company_id from user_companies
    const { data: membership, error: membershipError } = await supabase
      .from("user_companies")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership?.company_id) {
      setError("Company not found for this user.");
      setLoading(false);
      return;
    }

    // 2️⃣ Load company details (⭐ include ID)
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("id, name, annual_price, renewal_date, license_count")
      .eq("id", membership.company_id)
      .single();

    if (companyError || !companyData) {
      setError("Unable to load company billing details.");
      setLoading(false);
      return;
    }

    // Auto‑advance renewal date if expired
    const today = new Date();
    let renewal = new Date(companyData.renewal_date);

    if (renewal < today) {
      renewal.setFullYear(renewal.getFullYear() + 1);
    }

    setCompany({
      ...companyData,
      renewal_date: renewal.toISOString(),
    });

    setLoading(false);
  }

  // ⭐ FIXED — Now calls /api/license/renew instead of create-checkout
  async function processPayment() {
    if (!company) return;

    setProcessing(true);

    try {
      const res = await fetch("/api/license/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: company.id, // ⭐ REQUIRED
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        alert(data.error || "Unable to start renewal payment.");
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
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!company) return <p className="p-6">No company data found.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Renew Annual Payment</h1>

      <div className="bg-white border rounded p-4 shadow-sm space-y-2">
        <p>
          <strong>Company:</strong> {company.name}
        </p>

        <p>
          <strong>Total Licenses Allowed:</strong> {company.license_count}
        </p>

        <p>
          <strong>Next Renewal Date:</strong>{" "}
          {new Date(company.renewal_date).toLocaleDateString()}
        </p>

        <hr className="my-2" />

        <p>
          <strong>Annual Fee to Pay:</strong>{" "}
          <span className="font-semibold text-emerald-700 text-lg">
            ₦{company.annual_price.toLocaleString()}
          </span>
        </p>
      </div>

      <button
        onClick={processPayment}
        disabled={processing}
        className={`mt-4 px-4 py-2 rounded text-white ${
          processing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {processing ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}
