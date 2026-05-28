"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientDashboardPage() {
  const supabase = supabaseBrowser();

  const [company, setCompany] = useState<any>(null);
  const [nextRenewal, setNextRenewal] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [renewalStatus, setRenewalStatus] =
    useState<"DUE" | "NOT_DUE">("NOT_DUE");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      const userId = user.id;

      const { data: membership } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", userId)
        .single();

      if (!membership) return;

      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", membership.company_id)
        .single();

      setCompany(companyData);

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
    <div className="p-6 space-y-10 max-w-6xl mx-auto">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Client Dashboard
      </h1>

      {/* Company Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="Company Name" value={company?.name ?? "—"} />

        <DashboardCard
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

        <DashboardCard
          title="Renewal Date"
          value={
            company?.renewal_date
              ? new Date(company.renewal_date).toLocaleDateString()
              : "—"
          }
        />

        <DashboardCard
          title="Total Licenses Allowed"
          value={company?.license_count ?? "—"}
        />
      </div>

      {/* Renewal Countdown */}
      {nextRenewal && (
        <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-center border border-slate-700">

          <p className="text-sm text-slate-400 uppercase tracking-widest">
            Days Remaining Until Renewal
          </p>

          <p
            className={`mt-4 text-7xl font-extrabold ${
              daysRemaining <= 7
                ? "text-red-500"
                : daysRemaining <= 30
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {daysRemaining}
          </p>

          <p className="text-slate-400 mt-3 text-sm">
            {daysRemaining > 0
              ? "before your annual maintenance fee is due"
              : "Payment is due or overdue"}
          </p>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </h2>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
