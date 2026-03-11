export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import QuoteCharts from "@/components/Charts/QuoteChart";
import ActivationChart from "@/components/Charts/ActivationChart";
import RevenueChart from "@/components/Charts/RevenueChart";
import LicenseRenewalChart from "@/components/Charts/LicenseRenewalChart";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";
import { redirect } from "next/navigation";

// -----------------------------
// TYPES
// -----------------------------

type Quote = {
  id: number;
  name: string;
  organization: string;
  email: string;
  details: string;
  createdAt: Date;
};

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
};

// -----------------------------
// PAGE
// -----------------------------

export default async function DashboardPage() {
  const { user, role } = await getUserAndRole();
  if (!user || role !== "admin") redirect("/login");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  // Fetch recent messages
  const recentMessages: Message[] = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch recent quote requests
  const recentQuotes: Quote[] = await db.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Analytics counts
  const totalMessages = await db.contactMessage.count();
  const totalQuotes = await db.quoteRequest.count();

  // -----------------------------
  // LICENSE ANALYTICS (Supabase)
  // -----------------------------

  const { data: licenses } = await supabase
    .from("licenses")
    .select("status");

  const totalLicenses = licenses?.length || 0;
  const activeLicenses = licenses?.filter(l => l.status === "active").length || 0;
  const expiredLicenses = licenses?.filter(l => l.status === "expired").length || 0;
  const revokedLicenses = licenses?.filter(l => l.status === "revoked").length || 0;

  // -----------------------------
  // REVENUE ANALYTICS
  // -----------------------------

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount");

  const totalRevenue =
    invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // -----------------------------
  // MRR (20% SERVICE FEE)
  // -----------------------------

  const LICENSE_BASE_PRICE = 1; 
  const mrr = activeLicenses * (LICENSE_BASE_PRICE * 0.2) / 12;

  // -----------------------------
  // ADVANCED ANALYTICS
  // -----------------------------

  const { data: monthlyActivations } = await supabase.rpc("monthly_license_activations");
  const { data: monthlyRevenue } = await supabase.rpc("monthly_revenue");

  const churnedLicenses = expiredLicenses + revokedLicenses;
  const churnRate = totalLicenses > 0 ? (churnedLicenses / totalLicenses) * 100 : 0;

  const avgRevenuePerUser = totalRevenue / (totalLicenses || 1);
  const avgCustomerLifespanYears = 3;
  const ltv = avgRevenuePerUser * avgCustomerLifespanYears;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-10">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-teal-900 dark:text-white">
            Dashboard
          </h1>
          <LogoutButton />
        </div>

        {/* Logged-in user */}
        {userData?.user && (
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Logged in as: <strong>{userData.user.email}</strong>
          </p>
        )}

        {/* Analytics Overview */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-800 dark:text-white mb-4">
            Analytics Overview
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <StatCard label="Total Licenses" value={totalLicenses} color="teal" />
            <StatCard label="Active Licenses" value={activeLicenses} color="green" />
            <StatCard label="Expired Licenses" value={expiredLicenses} color="yellow" />
            <StatCard label="Revoked Licenses" value={revokedLicenses} color="red" />
            <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} color="blue" />
            <StatCard label="MRR (20% Service)" value={`₦${mrr.toLocaleString()}`} color="purple" />
            <StatCard label="Churn Rate" value={`${churnRate.toFixed(1)}%`} color="red" />
            <StatCard label="Customer LTV" value={`₦${ltv.toLocaleString()}`} color="purple" />
          </div>
        </div>

        {/* Charts */}
        <QuoteCharts />

        <div className="space-y-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-teal-800 dark:text-white mb-4">
              Monthly Activation Trends
            </h2>
            <ActivationChart data={monthlyActivations || []} />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-teal-800 dark:text-white mb-4">
              Revenue Trends
            </h2>
            <RevenueChart data={monthlyRevenue || []} />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-teal-800 dark:text-white mb-4">
              License Renewal Trends
            </h2>
            <LicenseRenewalChart data={monthlyActivations || []} />
          </div>
        </div>

        {/* Recent Quote Requests */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-teal-800 dark:text-white mb-4">
            Recent Quote Requests
          </h2>

          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2">Name</th>
                  <th className="py-2">Organization</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((q: Quote) => (
                  <tr key={q.id} className="border-b dark:border-gray-700">
                    <td className="py-2">{q.name}</td>
                    <td className="py-2">{q.organization}</td>
                    <td className="py-2">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-teal-800 dark:text-white mb-4">
            Recent Messages
          </h2>

          <div className="space-y-4">
            {recentMessages.map((m: Message) => (
              <div
                key={m.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{m.email}</p>
                <p className="mt-2 text-gray-800 dark:text-gray-200">{m.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// -----------------------------
// STAT CARD COMPONENT
// -----------------------------

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color: string;
}) {
  const bg = {
    teal: "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700",
    green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700",
    red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
    blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
    purple: "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700",
    gray: "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700",
  }[color];

  return (
    <div className={`${bg} p-4 sm:p-6 rounded-xl shadow-sm border`}>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
