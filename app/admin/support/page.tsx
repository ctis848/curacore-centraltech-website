"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { TicketRow } from "@/types/admin";

export default function SupportPage() {
  const supabase = supabaseBrowser();
  const [tickets, setTickets] = useState<TicketRow[]>([]);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    const { data } = await supabase
      .from("Ticket")
      .select("*")
      .order("createdAt", { ascending: false });

    setTickets(data || []);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Support Tickets</h1>

      {tickets.length === 0 && (
        <p className="text-slate-500">No support tickets found.</p>
      )}

      <div className="space-y-3">
        {tickets.map((t) => (
          <a
            key={t.id}
            href={`/admin/support/${t.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50"
          >
            <p className="font-medium">{t.subject}</p>
            <p className="text-sm text-slate-600">Status: {t.status}</p>
            <p className="text-sm text-slate-600">Priority: {t.priority}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
