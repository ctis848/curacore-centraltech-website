"use client";

import { useState, useEffect } from "react";

function NotificationsPanel({ open }: { open: boolean }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border dark:border-gray-700 p-4 transition-all duration-300 ${
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Notifications</h4>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No notifications.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
            >
              {n.message}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPanel;
