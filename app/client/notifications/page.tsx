// FILE: app/client/notifications/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import MarkAsReadButton from "./MarkAsReadButton";

export default async function ClientNotificationsPage() {
  const supabase = supabaseServer();

  // Get logged-in client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        You must be logged in to view notifications.
      </div>
    );
  }

  // Fetch notifications for this client
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, created_at, read")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6">
      <h2 className="text-2xl font-bold">Your Notifications</h2>

      <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Message</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {notifications?.map((n) => (
            <tr
              key={n.id}
              className={`border-t ${!n.read ? "bg-yellow-50" : ""}`}
            >
              <td className="p-2 font-semibold">{n.title}</td>
              <td className="p-2">{n.message}</td>
              <td className="p-2">
                {new Date(n.created_at).toLocaleString()}
              </td>
              <td className="p-2">
                {n.read ? (
                  <span className="text-green-600 font-medium">Read</span>
                ) : (
                  <span className="text-red-600 font-medium">Unread</span>
                )}
              </td>
              <td className="p-2">
                {!n.read && <MarkAsReadButton id={n.id} />}
              </td>
            </tr>
          ))}

          {notifications?.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-slate-500">
                No notifications yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
