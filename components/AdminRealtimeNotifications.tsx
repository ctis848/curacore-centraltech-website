"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface NotificationRow {
  id: string;
  message: string;
  created_at?: string;
}

export default function AdminRealtimeNotifications() {
  const supabase = createSupabaseClient();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          // Explicitly cast payload.new to your row type
          const row = payload.new as Partial<NotificationRow> | null;

          // Validate before using
          if (!row || typeof row !== "object") return;
          if (!row.id || !row.message) return;

          const safeRow: NotificationRow = {
            id: row.id,
            message: row.message,
            created_at: row.created_at ?? undefined,
          };

          setNotifications((prev) => [safeRow, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        🔔

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 space-y-3 z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Notifications
          </h3>

          {notifications.length === 0 && (
            <p className="text-gray-500 text-sm">No notifications yet</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 shadow-sm"
            >
              <p>{n.message}</p>
              {n.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
