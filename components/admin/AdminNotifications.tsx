"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function AdminNotifications() {
  const [notes, setNotes] = useState<Notification[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/notifications", {
        credentials: "include",
      });

      const data = await res.json();
      setNotes((data.notifications as Notification[]) || []);
    }

    load();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-80">
      <h3 className="font-bold mb-3">Notifications</h3>

      {notes.length === 0 ? (
        <p className="text-gray-500">No new notifications</p>
      ) : (
        notes.map((n) => (
          <div key={n.id} className="border-b py-2">
            <p className="font-semibold">{n.title}</p>
            <p className="text-gray-600 text-sm">{n.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
