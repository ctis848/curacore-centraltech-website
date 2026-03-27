"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/client/notifications");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string, read: boolean) {
    await fetch(`/api/client/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/client/notifications/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-slate-500">
        See important updates about your licenses, invoices, and account.
      </p>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">No notifications.</p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`border rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-3 ${
                n.read ? "bg-white" : "bg-slate-50 dark:bg-slate-900/40"
              }`}
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  {n.type}
                </p>
                <p>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id, true)}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
                {n.read && (
                  <button
                    onClick={() => markRead(n.id, false)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Mark as unread
                  </button>
                )}
                <button
                  onClick={() => remove(n.id)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
