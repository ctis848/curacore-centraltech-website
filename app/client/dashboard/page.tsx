"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/client/DashboardSkeleton";

type DashboardStats = {
  activeLicenses: number;
  totalLicenses: number;
  unpaidInvoices: number;
  totalInvoices: number;
  openTickets: number;
  daysRemaining: number | null;
  annualFee: number | null;
  nextRenewalDate: string | null;
};

function getDaysRemaining(dateString: string | null) {
  if (!dateString) return null;
  const now = new Date();
  const expiry = new Date(dateString);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeLicenses: 0,
    totalLicenses: 0,
    unpaidInvoices: 0,
    totalInvoices: 0,
    openTickets: 0,
    daysRemaining: null,
    annualFee: null,
    nextRenewalDate: null,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/client/login");
          return;
        }

        const userId = user.id;

        const [licensesRes, invoicesRes, ticketsRes, billingRes] =
          await Promise.all([
            supabase
              .from("Licenses")
              .select("id, license_key, created_at")
              .eq("client_id", userId),

            supabase
              .from("Invoice")
              .select("id, status")
              .eq("userId", userId),

            supabase
              .from("SupportTicket")
              .select("id, status")
              .eq("userId", userId),

            supabase
              .from("ClientBilling")
              .select("annual_fee, next_renewal_date")
              .eq("userId", userId)
              .single(),
          ]);

        const licenses = licensesRes.data || [];
        const invoices = invoicesRes.data || [];
        const tickets = ticketsRes.data || [];

        const activeLicenses = licenses.length;
        const unpaidInvoices = invoices.filter((i) => i.status !== "PAID").length;
        const openTickets = tickets.filter((t) => t.status === "OPEN").length;

        const annualFee = billingRes.data?.annual_fee ?? null;
        const nextRenewalDate = billingRes.data?.next_renewal_date ?? null;
        const daysRemaining = getDaysRemaining(nextRenewalDate);

        setStats({
          activeLicenses,
          totalLicenses: licenses.length,
          unpaidInvoices,
          totalInvoices: invoices.length,
          openTickets,
          daysRemaining,
          annualFee,
          nextRenewalDate,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Active Licenses",
      value: stats.activeLicenses,
      subtitle: `${stats.totalLicenses} total`,
      subtitleColor: "text-slate-600",
      onClick: () => router.push("/client/active-licenses"),
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Unpaid Invoices",
      value: stats.unpaidInvoices,
      subtitle: `${stats.totalInvoices} invoices`,
      subtitleColor: "text-slate-600",
      onClick: () => router.push("/client/invoice-history"),
      color: "bg-amber-50 border-amber-200",
    },
    {
      title: "Open Support Tickets",
      value: stats.openTickets,
      subtitle: "Need attention",
      subtitleColor: "text-slate-600",
      onClick: () => router.push("/client/support"),
      color: "bg-rose-50 border-rose-200",
    },
  ];

  const formatNaira = (num: number | null) =>
    num == null
      ? "—"
      : num.toLocaleString("en-NG", { style: "currency", currency: "NGN" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Client Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Overview of your licenses, payments, and support activity.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <button
                key={card.title}
                onClick={card.onClick}
                className={`flex flex-col items-start rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md ${card.color}`}
              >
                <span className="text-xs font-medium uppercase text-slate-500">
                  {card.title}
                </span>

                <span className="mt-2 text-2xl font-semibold text-slate-900">
                  {card.value}
                </span>

                <span className={`mt-1 text-xs font-medium ${card.subtitleColor}`}>
                  {card.subtitle}
                </span>
              </button>
            ))}
          </div>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                License Summary
              </h2>
              <p className="text-sm text-slate-600">
                You have{" "}
                <span className="font-semibold">{stats.activeLicenses}</span>{" "}
                active licenses out of{" "}
                <span className="font-semibold">{stats.totalLicenses}</span>.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm space-y-1">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Annual Billing
              </h2>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Annual Fee:</span>{" "}
                {formatNaira(stats.annualFee)}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Next Renewal Date:</span>{" "}
                {stats.nextRenewalDate ?? "Not set"}
              </p>
              {stats.daysRemaining != null && (
                <p
                  className={`text-sm font-semibold ${
                    stats.daysRemaining <= 7
                      ? "text-red-600"
                      : stats.daysRemaining <= 30
                      ? "text-amber-600"
                      : "text-emerald-700"
                  }`}
                >
                  {stats.daysRemaining > 0
                    ? `${stats.daysRemaining} day(s) remaining until annual payment.`
                    : "Annual payment is due or overdue."}
                </p>
              )}
            </div>
          </section>

          {/* ⭐ BIG DIGITAL COUNTDOWN TIMER */}
          {stats.daysRemaining != null && (
            <div
              className="
                mt-6 
                w-full 
                bg-black 
                text-green-400 
                rounded-2xl 
                p-6 
                flex 
                flex-col 
                items-center 
                justify-center 
                shadow-xl
              "
            >
              <span className="text-sm text-gray-300 tracking-widest uppercase">
                Days Remaining Until Renewal
              </span>

              <span
                className={`
                  mt-3 
                  font-mono 
                  text-7xl 
                  md:text-8xl 
                  font-bold 
                  tracking-widest 
                  ${
                    stats.daysRemaining <= 7
                      ? "text-red-500"
                      : stats.daysRemaining <= 30
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                `}
              >
                {stats.daysRemaining}
              </span>

              <span className="mt-2 text-gray-400 text-sm">
                {stats.daysRemaining > 0
                  ? "before your annual maintenance fee is due"
                  : "Payment is due or overdue"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
