"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  License: {
    productName: string | null;
    licenseKey: string | null;
  } | null;
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/client/support/${params.id}`)
      .then((r) => r.json())
      .then((data) => setTicket(data))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (!ticket || (ticket as any).error) {
    return (
      <div>
        <p className="text-slate-500 mb-4">Ticket not found.</p>
        <button
          onClick={() => router.push("/client/support")}
          className="text-sm text-teal-600 hover:underline"
        >
          Back to support
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <button
        onClick={() => router.push("/client/support")}
        className="text-sm text-teal-600 hover:underline"
      >
        ← Back to tickets
      </button>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="text-xs text-slate-500">
        <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
      </div>

      {ticket.License && (
        <div className="border rounded-lg px-4 py-3 text-sm">
          <p className="font-semibold mb-1">Linked License</p>
          <p>{ticket.License.productName || "License"}</p>
          <p className="font-mono text-xs text-slate-500">
            {ticket.License.licenseKey}
          </p>
        </div>
      )}

      <div className="border rounded-lg px-4 py-3 text-sm whitespace-pre-wrap">
        {ticket.message}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    OPEN: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-sky-100 text-sky-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
    CLOSED: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
