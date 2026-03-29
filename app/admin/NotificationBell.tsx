// FILE: app/admin/NotificationBell.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function loadCount() {
    const res = await fetch("/api/admin/notifications/unread-count");
    const data = await res.json();
    setCount(data.count || 0);
  }

  useEffect(() => {
    loadCount();

    // REALTIME LISTENER
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <a href="/admin/notifications" className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-slate-700 hover:text-slate-900 transition"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 
          6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 
          6 8.388 6 11v3.159c0 .538-.214 1.055-.595 
          1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </a>
  );
}
