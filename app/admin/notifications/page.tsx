// FILE: app/admin/notifications/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import MarkAsReadButton from "./MarkAsReadButton";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  clients: {
    name: string | null;
    email: string | null;
  }[] | null;
};

export default async function AdminNotificationsPage() {
  const supabase = supabaseServer();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, created_at, read, clients(name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Client</th>
            <th className="p-2">Email</th>
            <th className="p-2">Title</th>
            <th className="p-2">Message</th>
            <th className="p-2">Created</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {(notifications as NotificationRow[])?.map((n) => (
            <tr
              key={n.id}
              className={`border-t ${!n.read ? "bg-yellow-50" : ""}`}
            >
              <td className="p-2">{n.clients?.[0]?.name ?? "—"}</td>
              <td className="p-2">{n.clients?.[0]?.email ?? "—"}</td>
              <td className="p-2 font-semibold">{n.title}</td>
              <td className="p-2">{n.message}</td>
              <td className="p-2">
                {n.created_at
                  ? new Date(n.created_at).toLocaleString()
                  : "—"}
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
              <td colSpan={7} className="p-4 text-center text-slate-500">
                No notifications found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
