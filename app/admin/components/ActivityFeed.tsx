"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function ActivityFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial activity events
    fetch("/admin/api/activity")
      .then((res) => res.json())
      .then((data) => setEvents(data));

    // Real-time updates via Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "mt1",
    });

    const channel = pusher.subscribe("activity-feed");
    channel.bind("new-event", (data: any) => {
      setEvents((prev) => [data, ...prev]);
    });

    return () => {
      pusher.unsubscribe("activity-feed");
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Activity Feed
      </h2>

      {events.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">No activity yet.</p>
      )}

      <div className="space-y-3">
        {events.map((e, i) => (
          <div
            key={i}
            className="border-b dark:border-gray-700 pb-2 last:border-none"
          >
            <p className="dark:text-white">{e.message}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(e.time).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
