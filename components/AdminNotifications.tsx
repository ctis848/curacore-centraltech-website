"use client";

import { useState } from "react";

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, text: "New activation request received" },
    { id: 2, text: "License expiring soon" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        🔔
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="text-sm text-gray-700 dark:text-gray-300">
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
