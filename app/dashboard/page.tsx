import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import QuoteCharts from "@/components/Charts/QuoteChart";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  // Fetch recent messages
  const recentMessages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch recent quote requests
  const recentQuotes = await db.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Analytics counts
  const totalMessages = await db.contactMessage.count();
  const totalQuotes = await db.quoteRequest.count();

  // Simple active user fallback
  const activeUsers = userData?.user ? 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-teal-900">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Logged-in user */}
        {userData?.user && (
          <p className="text-gray-700">
            Logged in as: <strong>{userData.user.email}</strong>
          </p>
        )}

        {/* Analytics Overview */}
        <div>
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Analytics Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-teal-50 border border-teal-200 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Contact Messages</p>
              <p className="text-3xl font-black text-teal-900">{totalMessages}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Quote Requests</p>
              <p className="text-3xl font-black text-yellow-700">{totalQuotes}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-black text-blue-700">{activeUsers}</p>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-xl font-bold text-green-700">Operational</p>
            </div>

          </div>
        </div>

        {/* Charts */}
        <QuoteCharts />

        {/* Recent Quote Requests */}
        <div>
          <h2 className="text-xl font-bold text-teal-800 mb-4">Recent Quote Requests</h2>

          <div className="bg-white border rounded-xl shadow p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Organization</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="border-b">
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
          <h2 className="text-xl font-bold text-teal-800 mb-4">Recent Messages</h2>

          <div className="space-y-4">
            {recentMessages.map((m) => (
              <div key={m.id} className="bg-gray-50 p-4 rounded-xl border shadow-sm">
                <p className="font-semibold">{m.name}</p>
                <p className="text-gray-600 text-sm">{m.email}</p>
                <p className="mt-2 text-gray-800">{m.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
