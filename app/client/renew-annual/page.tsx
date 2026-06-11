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

    const url = new URL(window.location.href);
    const companyIdFromLink = url.searchParams.get("company_id");

    // ⭐ PRIORITY 1 — Magic link (NO LOGIN REQUIRED)
    if (companyIdFromLink) {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, annual_price, renewal_date, license_count")
        .eq("id", companyIdFromLink)
        .single();

      if (error || !data) {
        setError("Invalid or expired renewal link.");
        setLoading(false);
        return;
      }

      prepareCompany(data);
      return;
    }

    // ⭐ PRIORITY 2 — Logged-in user fallback
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from("user_companies")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (!membership?.company_id) {
      setError("Company not found for this user.");
      setLoading(false);
      return;
    }

    const { data: companyData } = await supabase
      .from("companies")
      .select("id, name, annual_price, renewal_date, license_count")
      .eq("id", membership.company_id)
      .single();

    if (!companyData) {
      setError("Unable to load company billing details.");
      setLoading(false);
      return;
    }

    prepareCompany(companyData);
  }

  function prepareCompany(companyData: any) {
    const today = new Date();
    let renewal = new Date(companyData.renewal_date);

    // ⭐ Auto-correct expired renewal dates
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
    setError("");

    try {
      const res = await fetch("/api/license/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: company.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        setError(data.error || "Unable to start renewal payment.");
        setProcessing(false);
        return;
      }

      // ⭐ Direct redirect to Paystack
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Unable to start payment.");
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
    <div className="p-6 max-w-4xl mx-auto space-y-12">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Renew Annual Payment
      </h1>

      {/* COMPANY SUMMARY CARD */}
      <div className="rounded-3xl shadow-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {company.name}
          </h2>

          <span className="px-4 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            COMPANY ID: {company.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
            <p className="text-xs text-slate-600">Total Licenses Allowed</p>
            <p className="mt-2 text-3xl font-extrabold text-purple-800">
              {company.license_count}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
            <p className="text-xs text-slate-600">Next Renewal Date</p>
            <p className="mt-2 text-3xl font-extrabold text-blue-800">
              {new Date(company.renewal_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-md mt-4">
          <p className="text-xs text-slate-600">Annual Fee</p>
          <p className="mt-2 text-4xl font-extrabold text-emerald-700">
            ₦{company.annual_price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* PAY BUTTON */}
      <button
        onClick={processPayment}
        disabled={processing}
        className={`w-full py-5 text-xl font-bold rounded-2xl shadow-xl transition-all active:scale-95 ${
          processing
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-2xl hover:brightness-110"
        }`}
      >
        {processing
          ? "Processing Payment…"
          : `Pay ₦${company.annual_price.toLocaleString()} Securely`}
      </button>

      {/* BANK TRANSFER OPTION */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8">
        <h2 className="text-xl font-bold text-slate-900">
          Pay by Bank Transfer (First Bank Nigeria)
        </h2>

        <p className="text-sm text-slate-700 leading-relaxed">
          You can also pay directly into our dedicated virtual account. Your
          payment will be automatically detected and your renewal will be
          activated instantly.
        </p>

        <div className="bg-slate-100 rounded-2xl p-6 space-y-3 shadow-inner">
          <p className="text-sm"><strong>Bank:</strong> First Bank Nigeria</p>
          <p className="text-sm"><strong>Account Number:</strong> 2022362320</p>
          <p className="text-sm"><strong>Account Name:</strong> Central Tech Information System Ltd</p>
          <p className="text-xs text-slate-500">(This is your dedicated Paystack DVA)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <button
            onClick={() => navigator.clipboard.writeText("2022362320")}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Copy Account Number
          </button>

          <button
            onClick={() => alert("Thank you! Paystack will automatically verify your transfer shortly.")}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          >
            I Have Paid — Confirm Transfer
          </button>

          <label className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition text-center cursor-pointer">
            Upload Proof of Payment
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => alert("Proof uploaded! Admin will verify manually.")}
            />
          </label>

          <button
            onClick={() => window.location.href = "intent://bankapp#Intent;scheme=bank;end"}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Open Bank App
          </button>
        </div>

        <button
          onClick={() => alert("Please transfer to First Bank Nigeria 2022362320. Your renewal will activate automatically.")}
          className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:brightness-110 transition"
        >
          Pay by Bank Transfer (First Bank Nigeria)
        </button>

        <p className="text-xs text-slate-500 text-center">
          After payment, your renewal will be confirmed automatically via Paystack.
        </p>
      </div>

    </div>
  );
}
