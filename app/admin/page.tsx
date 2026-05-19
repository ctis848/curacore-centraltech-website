"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalActiveLicenses: 0,
    totalInactiveLicenses: 0,
    totalExpiredAnnualFee: 0,
    totalPayments: 0,
    totalPlansPurchased: 0,
    pendingLicenseRequests: 0,
    openSupportTickets: 0,
  });

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [dueAnnualFees, setDueAnnualFees] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);

        // 1. Verify admin session
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.email?.endsWith("@client.com")) {
          router.push("/auth/admin/login");
          return;
        }

        // 2. Fetch all required data
        const [licensesRes, invoicesRes, requestsRes, ticketsRes] =
          await Promise.all([
            supabase.from("License").select(`
              id,
              user_id,
              status,
              expires_at,
              created_at,
              "productName",
              "licenseKey",
              "annualFeePercent",
              "annualFeePaidUntil"
            `),

            supabase.from("invoices").select(`
              id,
              amount,
              status,
              created_at,
              company_id
            `),

            supabase.from("LicenseRequest").select(`
              id,
              "userId",
              "productName",
              "requestedAt",
              status,
              "requestKey",
              "licenseKey"
            `),

            supabase.from("support_tickets").select(`
              id,
              user_id,
              subject,
              message,
              status,
              created_at
            `),
          ]);

        // ⭐ MAP LICENSES
        const licenses = (licensesRes.data || []).map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          status: l.status,
          expiresAt: l.expires_at,
          createdAt: l.created_at,
          productName: l.productName,
          licenseKey: l.licenseKey,
          annualFeePercent: l.annualFeePercent,
          annualFeePaidUntil: l.annualFeePaidUntil,
        }));

        // ⭐ MAP INVOICES
        const invoices = (invoicesRes.data || []).map((i: any) => ({
          id: i.id,
          userId: i.company_id,
          amount: i.amount,
          status: i.status,
          createdAt: i.created_at,
        }));

        // ⭐ MAP LICENSE REQUESTS
        const requests = (requestsRes.data || []).map((r: any) => ({
          id: r.id,
          userId: r.userId,
          productName: r.productName,
          requestedAt: r.requestedAt,
          status: r.status,
          requestKey: r.requestKey,
          licenseKey: r.licenseKey,
        }));

        // ⭐ MAP SUPPORT TICKETS
        const tickets = (ticketsRes.data || []).map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          subject: t.subject,
          message: t.message,
          status: t.status,
          createdAt: t.created_at,
        }));

        // ⭐ COMPUTE STATS
        const totalActiveLicenses = licenses.filter(
          (l) => l.status === "ACTIVE"
        ).length;

        const totalInactiveLicenses = licenses.filter(
          (l) => l.status !== "ACTIVE"
        ).length;

        const totalExpiredAnnualFee = licenses.filter((l) => {
          if (!l.annualFeePaidUntil) return true;
          return new Date(l.annualFeePaidUntil) < new Date();
        }).length;

        const totalPayments = invoices.length;

        const totalPlansPurchased = invoices.filter(
          (i) => i.status === "PAID"
        ).length;

        const pendingLicenseRequests = requests.filter(
          (r) => r.status === "PENDING"
        ).length;

        const openSupportTickets = tickets.filter(
          (t) => t.status === "OPEN"
        ).length;

        // ⭐ Annual fee due soon (30 days)
        const dueAnnualFeesList = licenses.filter((l) => {
          if (!l.annualFeePaidUntil) return true;
          const dueDate = new Date(l.annualFeePaidUntil);
          const now = new Date();
          const diff =
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 30;
        });

        // ⭐ Pending requests sorted
        const pendingRequestsList = requests
          .filter((r) => r.status === "PENDING")
          .sort(
            (a, b) =>
              new Date(a.requestedAt).getTime() -
              new Date(b.requestedAt).getTime()
          )
          .slice(0, 5);

        // ⭐ Recent open tickets
        const recentTicketsList = tickets
          .filter((t) => t.status === "OPEN")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        // ⭐ UPDATE STATE
        setStats({
          totalActiveLicenses,
          totalInactiveLicenses,
          totalExpiredAnnualFee,
          totalPayments,
          totalPlansPurchased,
          pendingLicenseRequests,
          openSupportTickets,
        });

        setPendingRequests(pendingRequestsList);
        setDueAnnualFees(dueAnnualFeesList);
        setRecentTickets(recentTicketsList);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router, supabase]);

  const cards = [
    {
      title: "Active Licenses",
      value: stats.totalActiveLicenses,
      subtitle: "Across all clients",
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      title: "Inactive / Expired Licenses",
      value: stats.totalInactiveLicenses,
      subtitle: "Need attention",
      color: "bg-slate-50 border-slate-200",
    },
    {
      title: "Annual Fee Expired",
      value: stats.totalExpiredAnnualFee,
      subtitle: "20% fee overdue",
      color: "bg-rose-50 border-rose-200",
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      subtitle: "All invoices",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Plans Purchased",
      value: stats.totalPlansPurchased,
      subtitle: "Paid invoices",
      color: "bg-amber-50 border-amber-200",
    },
    {
      title: "Pending License Requests",
      value: stats.pendingLicenseRequests,
      subtitle: "Awaiting approval",
      color: "bg-indigo-50 border-indigo-200",
    },
    {
      title: "Open Support Tickets",
      value: stats.openSupportTickets,
      subtitle: "Support queue",
      color: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Global overview of licenses, payments, annual fees, and support.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading admin data...</p>
      ) : (
        <>
          {/* CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`flex flex-col rounded-xl border p-4 shadow-sm ${card.color}`}
              >
                <span className="text-xs font-medium uppercase text-slate-500">
                  {card.title}
                </span>
                <span className="mt-2 text-2xl font-semibold text-slate-900">
                  {card.value}
                </span>
                <span className="mt-1 text-xs text-slate-600">
                  {card.subtitle}
                </span>
              </div>
            ))}
          </div>

          {/* LISTS */}
          <section className="grid gap-4 md:grid-cols-2">
            {/* Pending Requests */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Pending License Requests
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No pending license requests.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {pendingRequests.map((req) => (
                    <li
                      key={req.id}
                      className="flex items-center justify-between border rounded px-2 py-1"
                    >
                      <div>
                        <p className="font-medium">
                          {req.productName || "Unknown Product"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Request ID: {req.id}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/admin/license-requests/${req.id}`)
                        }
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Review
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Annual Fee Due */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Annual 20% Fee Due Soon
              </h3>
              {dueAnnualFees.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No clients with upcoming annual fee due.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {dueAnnualFees.slice(0, 5).map((lic) => (
                    <li
                      key={lic.id}
                      className="flex items-center justify-between border rounded px-2 py-1"
                    >
                      <div>
                        <p className="font-medium">
                          {lic.productName || "Unknown Product"}
                        </p>
                        <p className="text-xs text-slate-500">
                          License ID: {lic.id}
                        </p>
                      </div>
                      <span className="text-xs text-amber-700 font-medium">
                        20% fee due
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Support Tickets */}
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Open Support Tickets
            </h3>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No open support tickets at the moment.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentTickets.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between border rounded px-2 py-1"
                  >
                    <div>
                      <p className="font-medium">{t.subject}</p>
                      <p className="text-xs text-slate-500">
                        Ticket ID: {t.id}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/support/${t.id}`)}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
