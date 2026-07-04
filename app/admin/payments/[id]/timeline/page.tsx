"use client";

import { useEffect, useState } from "react";

export type TimelineEvent = {
  id: string;
  payment_id: string;
  event_type: string;
  message: string | null;
  created_at: string;
};

export default function Page({ params }: { params: { id: string } }) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  async function loadTimeline() {
    const res = await fetch(`/api/admin/payments/${params.id}/timeline`);
    const json = await res.json();

    if (json.success) {
      setTimelineEvents(json.data as TimelineEvent[]);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payment Timeline</h1>

      {timelineEvents.map((event) => (
        <div
          key={event.id}
          className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-600"
        >
          <p className="font-semibold">{event.event_type}</p>
          <p className="text-sm text-slate-600">{event.message}</p>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(event.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
