"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientDashboardPage() {
  const supabase = supabaseBrowser();

  const [company, setCompany] = useState<any>(null);
  const [nextRenewal, setNextRenewal] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [renewalStatus, setRenewalStatus] = useState<"DUE" | "NOT_DUE">("NOT_DUE");

  useEffect(() => {
    async function loadDashboard() {
      // ⭐ FIX: Use getSession() instead of getUser()
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      const userId = user.id;

      // 1️⃣ Get company_id
      const { data: membership } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", userId)
        .single();

      if (!membership) return;

      // 2️⃣ Load company
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", membership.company_id)
        .single();

      setCompany(companyData);

      // 3️⃣ Load renewal info
      const { data: renewalData } = await supabase
        .from("License")
        .select("annualFeePaidUntil")
        .eq("userId", userId)
        .eq("status", "ACTIVE")
        .order("annualFeePaidUntil", { ascending: false })
        .limit(1);

      if (renewalData && renewalData.length > 0) {
        const nextDate = new Date(renewalData[0].annualFeePaidUntil);
        setNextRenewal(nextDate);

        const today = new Date();
        const diff = Math.ceil(
          (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        setDaysRemaining(diff);
        setRenewalStatus(diff <= 0 ? "DUE" : "NOT_DUE");
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">

      {/* ⭐ TITLE AT THE TOP */}
      <h1 className="text-2xl font-bold">Client Dashboard</h1>

      {/* ⭐ COMPANY CARDS ALWAYS VISIBLE */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Company Name" value={company?.name ?? "—"} />

        <Card
          title="Annual Fee"
          value={
            company?.annual_price
              ? company.annual_price.toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })
              : "—"
          }
        />

        <Card
          title="Renewal Date"
          value={company?.renewal_date ?? "—"}
        />

        <Card
          title="Total Licenses Allowed"
          value={company?.license_count ?? "—"}
        />
      </div>

      {/* ⭐ RENEWAL COUNTDOWN */}
      {nextRenewal && (
        <div className="p-6 bg-black text-green-400 rounded-xl shadow-lg text-center">
          <p className="text-sm text-gray-300 uppercase tracking-widest">
            Days Remaining Until Renewal
          </p>

          <p
            className={`mt-3 text-7xl font-bold ${
              daysRemaining <= 7
                ? "text-red-500"
                : daysRemaining <= 30
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {daysRemaining}
          </p>

          <p className="text-gray-400 mt-2 text-sm">
            {daysRemaining > 0
              ? "before your annual maintenance fee is due"
              : "Payment is due or overdue"}
          </p>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white rounded shadow p-4 border border-slate-200">
      <h2 className="text-sm font-semibold text-slate-600 uppercase">{title}</h2>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
