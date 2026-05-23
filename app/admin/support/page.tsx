"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { TicketRow } from "@/types/admin";

export default function SupportPage() {
  const supabase = supabaseBrowser();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);

    const { data, error } = await supabase
      .from("Ticket")
      .select("*")
      .order("createdAt", { ascending: false });

    if (!error && data) {
      setTickets(data);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Support Tickets
      </h1>

      {/* EMPTY STATE */}
      {!loading && tickets.length === 0 && (
        <p className="text-slate-500 text-lg bg-slate-100 border border-slate-200 p-4 rounded-xl shadow">
          No support tickets found.
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-slate-500 text-lg bg-slate-100 border border-slate-200 p-4 rounded-xl shadow">
          Loading tickets…
        </p>
      )}

      {/* TICKETS LIST */}
      <div className="space-y-4">
        {!loading &&
          tickets.map((t) => (
            <a
              key={t.id}
              href={`/admin/support/${t.id}`}
              className="block bg-white border border-slate-200 rounded-2xl shadow hover:shadow-lg hover:bg-slate-50 transition p-5"
            >
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-slate-800">
                  {t.subject}
                </p>

                {/* STATUS BADGE — FIXED */}
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    t.status?.toUpperCase() === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : t.status?.toUpperCase() === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* PRIORITY — FIXED */}
              <p className="text-sm text-slate-600 mt-1">
                Priority:{" "}
                <span
                  className={`font-semibold ${
                    t.priority?.toUpperCase() === "HIGH"
                      ? "text-red-600"
                      : t.priority?.toUpperCase() === "MEDIUM"
                      ? "text-yellow-600"
                      : "text-slate-600"
                  }`}
                >
                  {t.priority}
                </span>
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Created: {new Date(t.createdAt).toLocaleString()}
              </p>
            </a>
          ))}
      </div>
    </div>
  );
}
