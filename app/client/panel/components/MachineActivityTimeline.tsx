"use client";

import { useEffect, useState } from "react";

function MachineActivityTimeline({ machineId }: { machineId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/machines/${machineId}/timeline`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.timeline || []);
        setLoading(false);
      });
  }, [machineId]);

  const typeColors: Record<string, string> = {
    START: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    STOP: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    HEARTBEAT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    ERROR: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Loading activity timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">No activity recorded.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Activity Timeline
      </h3>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-4">

            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-600"></div>
              <div className="w-px h-full bg-gray-300 dark:bg-gray-600"></div>
            </div>

            <div className="flex-1 pb-6 border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    typeColors[event.type] || "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {event.type}
                </span>

                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
                </span>
              </div>

              <p className="mt-2 text-gray-800 dark:text-gray-200">{event.description}</p>

              {event.ip && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  IP Address: <strong>{event.ip}</strong>
                </p>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineActivityTimeline;
