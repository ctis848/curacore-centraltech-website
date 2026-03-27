"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SupportTicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/client/support/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setTicket(d.ticket));
  }, [id]);

  if (!ticket) return <p className="p-6">Loading ticket...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{ticket.subject}</h1>

      <div className="p-6 bg-white border rounded-lg shadow space-y-3">
        <p className="text-gray-600">{ticket.message}</p>
        <p className="text-sm text-gray-500">
          Status: {ticket.status}
        </p>
        <p className="text-xs text-gray-500">
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
