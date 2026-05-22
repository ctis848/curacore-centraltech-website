import React from "react";
import { TimelineEvent } from "@/app/admin/payments/page";

interface TimelineDrawerProps {
  open: boolean;
  events: TimelineEvent[];
  onClose: () => void;
}

export default function TimelineDrawer({
  open,
  events,
  onClose,
}: TimelineDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end bg-black/30 z-50">
      <div className="w-96 bg-white h-full shadow-xl p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Payment Timeline</h2>

        {events.length === 0 && (
          <p className="text-slate-500">No timeline events found.</p>
        )}

        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="border-l-4 border-purple-500 pl-3">
              <p className="font-semibold">{ev.event_type}</p>
              <p className="text-sm text-slate-600">{ev.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(ev.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-slate-200 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
