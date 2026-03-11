"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function NotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data } = await supabase.from("notifications").select("*");
    setNotifications(data || []);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="border p-4 rounded-lg">
                <p><strong>{n.title}</strong></p>
                <p>{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
