"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const now = new Date();
    setItems([
      {
        id: "N1",
        title: "License Activated",
        message: "Your CentralCore Pro license was activated successfully.",
        createdAt: now.toISOString(),
        read: false,
      },
      {
        id: "N2",
        title: "Invoice Due",
        message: "Invoice INV-1002 is due in 7 days.",
        createdAt: now.toISOString(),
        read: true,
      },
    ]);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className={`border rounded-lg p-4 bg-white ${
              !n.read ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{n.title}</h2>
              <span className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{n.message}</p>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-gray-500 text-sm">No notifications.</p>
        )}
      </div>
    </div>
  );
}
