"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function AdminNotifications() {
  const supabase = createClientComponentClient();
  const [notes, setNotes] = useState<Notification[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false });

      setNotes((data as Notification[]) || []);
    }

    load();
  }, [supabase]);

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
