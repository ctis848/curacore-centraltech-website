"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { TicketRow, TicketReplyRow, TicketCategory } from "@/types/admin";

interface PageProps {
  params: { id: string };
}

export default function TicketDetails({ params }: PageProps) {
  const supabase = supabaseBrowser();
  const [ticket, setTicket] = useState<TicketRow | null>(null);
  const [replies, setReplies] = useState<TicketReplyRow[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const id = params.id;

  useEffect(() => {
    loadTicket();
    loadReplies();
    subscribeRealtime();
  }, []);

  async function loadTicket() {
    const { data } = await supabase
      .from("Ticket")
      .select("*")
      .eq("id", id)
      .single();

    setTicket(data);
    setLoading(false);
  }

  async function loadReplies() {
    const { data } = await supabase
      .from("TicketReply")
      .select("*")
      .eq("ticketId", id)
      .order("createdAt", { ascending: true });

    setReplies(data || []);
  }

  function subscribeRealtime() {
    const channel = supabase
      .channel(`ticket-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "TicketReply", filter: `ticketId=eq.${id}` },
        (payload) => {
          setReplies((prev) => [...prev, payload.new as TicketReplyRow]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Ticket", filter: `id=eq.${id}` },
        (payload) => {
          setTicket(payload.new as TicketRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function sendReply() {
    if (!reply.trim()) return;

    const res = await fetch(`/api/admin/support/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply }),
    });

    const json = await res.json();
    alert(json.message);
    setReply("");
  }

  async function closeTicket() {
    const res = await fetch(`/api/admin/support/${id}/close`, {
      method: "POST",
    });

    const json = await res.json();
    alert(json.message);
  }

  async function setPriority(priority: "LOW" | "MEDIUM" | "HIGH") {
    const res = await fetch(`/api/admin/support/${id}/priority`, {
      method: "POST",
      body: JSON.stringify({ priority }),
    });

    const json = await res.json();
    alert(json.message);
  }

  async function setCategory(category: TicketCategory) {
    const res = await fetch(`/api/admin/support/${id}/category`, {
      method: "POST",
      body: JSON.stringify({ category }),
    });

    const json = await res.json();
    alert(json.message);
  }

  if (loading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Support Ticket</h1>

      <div className="bg-white border rounded p-4 space-y-2">
        <p><strong>Subject:</strong> {ticket.subject}</p>
        <p><strong>Message:</strong> {ticket.message}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Priority:</strong> {ticket.priority}</p>
        <p><strong>Category:</strong> {ticket.category}</p>
      </div>

      <div className="mt-4 space-x-3">
        <button onClick={() => setPriority("LOW")} className="px-3 py-1 bg-slate-500 text-white rounded">
          Low
        </button>
        <button onClick={() => setPriority("MEDIUM")} className="px-3 py-1 bg-amber-600 text-white rounded">
          Medium
        </button>
        <button onClick={() => setPriority("HIGH")} className="px-3 py-1 bg-red-600 text-white rounded">
          High
        </button>
      </div>

      <div className="mt-4 space-x-3">
        <button onClick={() => setCategory("GENERAL")} className="px-3 py-1 bg-slate-600 text-white rounded">
          General
        </button>
        <button onClick={() => setCategory("BILLING")} className="px-3 py-1 bg-emerald-600 text-white rounded">
          Billing
        </button>
        <button onClick={() => setCategory("TECHNICAL")} className="px-3 py-1 bg-blue-600 text-white rounded">
          Technical
        </button>
        <button onClick={() => setCategory("LICENSING")} className="px-3 py-1 bg-purple-600 text-white rounded">
          Licensing
        </button>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Conversation</h2>
        <div className="space-y-2 mb-4">
          {replies.map((r) => (
            <div
              key={r.id}
              className={`p-2 rounded border text-sm ${
                r.isFromAdmin ? "bg-slate-100" : "bg-emerald-50"
              }`}
            >
              <p className="font-medium">
                {r.isFromAdmin ? "Admin" : "User"} — {new Date(r.createdAt).toLocaleString()}
              </p>
              <p>{r.message}</p>
            </div>
          ))}
        </div>

        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Write a reply..."
        />
        <button
          onClick={sendReply}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send Reply
        </button>
      </div>

      {ticket.status !== "CLOSED" && (
        <button
          onClick={closeTicket}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Close Ticket
        </button>
      )}
    </div>
  );
}
