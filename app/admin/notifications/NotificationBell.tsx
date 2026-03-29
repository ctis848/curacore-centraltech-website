"use client";

import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setCount(data.count);
    }
    load();
  }, []);

  return (
    <div className="relative">
      <span className="text-xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
