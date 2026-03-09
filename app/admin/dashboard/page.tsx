import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import QuoteCharts from "@/components/Charts/QuoteChart";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";
import { redirect } from "next/navigation";

// -----------------------------
// TYPES (corrected to match Prisma)
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

  const activeUsers = userData?.user ? 1 : 0;

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
            <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Contact Messages</p>
              <p className="text-2xl sm:text-3xl font-black text-teal-900 dark:text-white">{totalMessages}</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Quote Requests</p>
              <p className="text-2xl sm:text-3xl font-black text-yellow-700 dark:text-yellow-300">{totalQuotes}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Active Users</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300">{activeUsers}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">System Status</p>
              <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">Operational</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <QuoteCharts />

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
