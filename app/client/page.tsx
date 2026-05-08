// app/client/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const cards = [
  { title: "Send License Request Key", href: "/client/license-request" },
  { title: "Active Licenses", href: "/client/active-licenses" },
  { title: "Machine History", href: "/client/machine-history" },
  { title: "Payment History", href: "/client/payment-history" },
  { title: "Invoice History", href: "/client/invoice-history" },
  { title: "Annual 20% History", href: "/client/annual-history" },
  { title: "Renew Annual Payment", href: "/client/renew-annual" },
  { title: "Transfer License", href: "/client/transfer-license" },
  { title: "Contact Support", href: "/client/support" },
];

export default function ClientDashboardPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [nextRenewal, setNextRenewal] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [renewalStatus, setRenewalStatus] = useState<"DUE" | "NOT_DUE">("NOT_DUE");

  useEffect(() => {
    async function loadRenewal() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      // Get the latest annualFeePaidUntil from active licenses
      const { data } = await supabase
        .from("License")
        .select("annualFeePaidUntil")
        .eq("userId", user.id)
        .eq("status", "ACTIVE")
        .order("annualFeePaidUntil", { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return;

      const nextDate = new Date(data[0].annualFeePaidUntil);
      setNextRenewal(nextDate);

      const today = new Date();
      const diff = Math.ceil(
        (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      setDaysRemaining(diff);
      setRenewalStatus(diff <= 0 ? "DUE" : "NOT_DUE");
    }

    loadRenewal();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>

      {/* ⭐ Annual Renewal Status Block */}
      {nextRenewal && (
        <div className="mb-6 p-4 bg-white border rounded shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Annual Renewal Status</h2>

          <p>
            <strong>Next Annual Payment:</strong>{" "}
            {nextRenewal.toLocaleDateString()}
          </p>

          <p>
            <strong>Days Remaining:</strong>{" "}
            {daysRemaining <= 0 ? "0 (Due Now)" : `${daysRemaining} days`}
          </p>

          {/* ⭐ Color-coded countdown bar */}
          <div className="w-full h-3 bg-slate-200 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                daysRemaining <= 0
                  ? "bg-red-600"
                  : daysRemaining <= 7
                  ? "bg-orange-500"
                  : "bg-emerald-600"
              }`}
              style={{
                width:
                  daysRemaining <= 0
                    ? "100%"
                    : `${Math.min((daysRemaining / 365) * 100, 100)}%`,
              }}
            ></div>
          </div>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                renewalStatus === "DUE"
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {renewalStatus}
            </span>
          </p>
        </div>
      )}

      {/* ⭐ Dashboard Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.href}
            onClick={() => router.push(card.href)}
            className="bg-white rounded shadow p-4 text-left hover:shadow-md transition border border-slate-200"
          >
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-sm text-slate-500">
              Click to open {card.title.toLowerCase()}.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
