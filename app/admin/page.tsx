"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

/* -----------------------------
   TYPES
------------------------------*/
interface ClientRenewal {
  id: string;
  companyName: string;
  renewalDate: string;
  annualFeePaidUntil: string | null;
  email: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  createdAt: string;
}

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
    annualDueSoon: 0,
    overdueCount: 0,
  });

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [dueSoonClients, setDueSoonClients] = useState<ClientRenewal[]>([]);
  const [overdueClients, setOverdueClients] = useState<ClientRenewal[]>([]);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);

  /* -----------------------------
     LOAD DASHBOARD DATA
  ------------------------------*/
  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.email?.endsWith("@client.com")) {
          router.push("/auth/admin/login");
          return;
        }

        const [licensesRes, invoicesRes, requestsRes, ticketsRes, clientsRes] =
          await Promise.all([
            supabase.from("License").select("*"),
            supabase.from("invoices").select("*"),
            supabase.from("LicenseRequest").select("*"),
            supabase.from("support_tickets").select("*"),
            supabase.from("Client").select(
              "id, companyName, renewalDate, annualFeePaidUntil, email"
            ),
          ]);

        const licenses = licensesRes.data || [];
        const invoices = invoicesRes.data || [];
        const requests = requestsRes.data || [];
        const tickets = ticketsRes.data || [];
        const clients: ClientRenewal[] = clientsRes.data || [];

        /* -----------------------------
           LICENSE METRICS
        ------------------------------*/
        const totalActiveLicenses = licenses.filter(
          (l: any) => l.status === "ACTIVE"
        ).length;

        const totalInactiveLicenses = licenses.filter(
          (l: any) => l.status !== "ACTIVE"
        ).length;

        const totalExpiredAnnualFee = licenses.filter((l: any) => {
          if (!l.annualFeePaidUntil) return true;
          return new Date(l.annualFeePaidUntil) < new Date();
        }).length;

        const totalPayments = invoices.length;
        const totalPlansPurchased = invoices.filter(
          (i: any) => i.status === "PAID"
        ).length;

        const pendingLicenseRequests = requests.filter(
          (r: any) => r.status === "PENDING"
        ).length;

        const openSupportTickets = tickets.filter(
          (t: any) => t.status === "OPEN"
        ).length;

        /* -----------------------------
           RENEWAL LOGIC
        ------------------------------*/
        const today = new Date();
        const next14 = new Date();
        next14.setDate(today.getDate() + 14);

        // Due in 14 days
        const dueSoon = clients.filter((c) => {
          if (!c.renewalDate) return false;
          const renewal = new Date(c.renewalDate);
          return renewal >= today && renewal <= next14;
        });

        // Overdue & unpaid
        const overdue = clients.filter((c) => {
          if (!c.renewalDate) return false;
          const renewal = new Date(c.renewalDate);
          if (renewal >= today) return false;

          if (!c.annualFeePaidUntil) return true;

          const paidUntil = new Date(c.annualFeePaidUntil);
          return paidUntil < renewal;
        });

        dueSoon.sort(
          (a, b) =>
            new Date(a.renewalDate).getTime() -
            new Date(b.renewalDate).getTime()
        );

        overdue.sort(
          (a, b) =>
            new Date(a.renewalDate).getTime() -
            new Date(b.renewalDate).getTime()
        );

        /* -----------------------------
           SUPPORT TICKETS
        ------------------------------*/
        const recentTicketsList: SupportTicket[] = tickets
          .filter((t: any) => t.status === "OPEN")
          .slice(0, 5);

        /* -----------------------------
           UPDATE STATE
        ------------------------------*/
        setStats({
          totalActiveLicenses,
          totalInactiveLicenses,
          totalExpiredAnnualFee,
          totalPayments,
          totalPlansPurchased,
          pendingLicenseRequests,
          openSupportTickets,
          annualDueSoon: dueSoon.length,
          overdueCount: overdue.length,
        });

        setPendingRequests(
          requests.filter((r: any) => r.status === "PENDING").slice(0, 5)
        );
        setDueSoonClients(dueSoon);
        setOverdueClients(overdue);
        setRecentTickets(recentTicketsList);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router, supabase]);

  /* -----------------------------
     URGENCY BADGE COLORS
  ------------------------------*/
  const getUrgencyBadge = (renewalDate: string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffDays = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 3) return "text-red-700 bg-red-100 border-red-300";
    if (diffDays <= 7) return "text-orange-700 bg-orange-100 border-orange-300";
    return "text-amber-700 bg-amber-100 border-amber-300";
  };

  /* -----------------------------
     EMAIL REMINDER
  ------------------------------*/
  const sendReminderEmail = async (client: ClientRenewal) => {
    await fetch("/api/send-renewal-reminder", {
      method: "POST",
      body: JSON.stringify({
        email: client.email,
        companyName: client.companyName,
        renewalDate: client.renewalDate,
      }),
    });

    alert(`Reminder sent to ${client.companyName}`);
  };

  /* -----------------------------
     RENDER UI
  ------------------------------*/
  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Global overview of licenses, renewals, payments, and support.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading admin data...</p>
      ) : (
        <>
          {/* METRIC CARDS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Active Licenses"
              value={stats.totalActiveLicenses}
              subtitle="Across all clients"
              color="from-emerald-50 to-emerald-100 border-emerald-200"
            />

            <DashboardCard
              title="Inactive / Expired Licenses"
              value={stats.totalInactiveLicenses}
              subtitle="Need attention"
              color="from-slate-50 to-slate-100 border-slate-200"
            />

            <DashboardCard
              title="Renewal Due in 14 Days"
              value={stats.annualDueSoon}
              subtitle="Clients approaching renewal"
              color="from-amber-50 to-amber-100 border-amber-200"
            />

            <DashboardCard
              title="Overdue Renewals"
              value={stats.overdueCount}
              subtitle="Unpaid after due date"
              color="from-red-50 to-red-100 border-red-200"
            />
          </div>

          {/* LIST SECTIONS */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* DUE SOON */}
            <ListSection
              title="Renewal Due in 14 Days"
              emptyText="No clients due soon."
              items={dueSoonClients}
              renderItem={(client: ClientRenewal) => (
                <ListItem
                  title={client.companyName}
                  subtitle={`Renewal Date: ${new Date(
                    client.renewalDate
                  ).toLocaleDateString()}`}
                  badge="Due Soon"
                  badgeColor={getUrgencyBadge(client.renewalDate)}
                  onEmail={() => sendReminderEmail(client)}
                />
              )}
            />

            {/* OVERDUE */}
            <ListSection
              title="Overdue & Unpaid"
              emptyText="No overdue clients."
              items={overdueClients}
              renderItem={(client: ClientRenewal) => (
                <ListItem
                  title={client.companyName}
                  subtitle={`Renewal Date: ${new Date(
                    client.renewalDate
                  ).toLocaleDateString()}`}
                  badge="Overdue"
                  badgeColor="text-red-700 bg-red-100 border-red-300"
                  onEmail={() => sendReminderEmail(client)}
                />
              )}
            />
          </section>

          {/* SUPPORT TICKETS */}
          <ListSection
            title="Open Support Tickets"
            emptyText="No open support tickets."
            items={recentTickets}
            renderItem={(t: SupportTicket) => (
              <ListItem
                title={t.subject}
                subtitle={`Ticket ID: ${t.id}`}
                badge="Open"
                badgeColor="text-blue-700 bg-blue-100 border-blue-300"
                onClick={() => router.push(`/admin/support/${t.id}`)}
              />
            )}
          />
        </>
      )}
    </div>
  );
}

/* -----------------------------
   COMPONENTS
------------------------------*/

function DashboardCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 shadow-md bg-gradient-to-br ${color} hover:shadow-lg transition`}
    >
      <span className="text-xs font-medium uppercase text-slate-600 tracking-wide">
        {title}
      </span>
      <span className="mt-3 text-3xl font-extrabold text-slate-900">
        {value}
      </span>
      <span className="mt-1 text-xs text-slate-600">{subtitle}</span>
    </div>
  );
}

function ListSection({
  title,
  emptyText,
  items,
  renderItem,
}: {
  title: string;
  emptyText: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-md">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-3 text-sm">{items.map(renderItem)}</ul>
      )}
    </div>
  );
}

function ListItem({
  title,
  subtitle,
  badge,
  badgeColor,
  onClick,
  onEmail,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  onClick?: () => void;
  onEmail?: () => void;
}) {
  return (
    <li className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-slate-50 transition">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs font-medium px-2 py-1 rounded border ${badgeColor}`}
        >
          {badge}
        </span>

        {onEmail && (
          <button
            onClick={onEmail}
            className="text-xs font-medium text-purple-600 hover:underline"
          >
            Email
          </button>
        )}

        {onClick && (
          <button
            onClick={onClick}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View
          </button>
        )}
      </div>
    </li>
  );
}
