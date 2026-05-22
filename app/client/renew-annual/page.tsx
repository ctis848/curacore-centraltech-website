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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

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

  async function processPayment() {
    if (!company) return;

    setProcessing(true);

    try {
      const res = await fetch("/api/license/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: company.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        alert(data.error || "Unable to start renewal payment.");
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

  if (loading)
    return (
      <div className="p-10 text-center text-lg animate-pulse text-slate-600">
        Loading company details…
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        {error}
      </div>
    );

  if (!company)
    return (
      <div className="p-10 text-center text-slate-600">
        No company data found.
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renew Annual Payment
      </h1>

      {/* Company Card */}
      <div className="rounded-2xl shadow-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {company.name}
          </h2>

          <span className="px-4 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            COMPANY ID: {company.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-sm">
            <p className="text-xs text-slate-600">Total Licenses Allowed</p>
            <p className="text-2xl font-bold text-purple-800">
              {company.license_count}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
            <p className="text-xs text-slate-600">Next Renewal Date</p>
            <p className="text-2xl font-bold text-blue-800">
              {new Date(company.renewal_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-sm mt-4">
          <p className="text-xs text-slate-600">Annual Fee</p>
          <p className="text-3xl font-extrabold text-emerald-700">
            ₦{company.annual_price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={processPayment}
        disabled={processing}
        className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition transform active:scale-95 ${
          processing
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:brightness-110"
        }`}
      >
        {processing ? "Processing Payment…" : "Pay Now"}
      </button>
    </div>
  );
}
