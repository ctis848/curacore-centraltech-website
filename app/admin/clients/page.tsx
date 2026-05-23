"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ClientRecord {
  id: number;
  email: string;
  companyName: string;
  totalLicenses: number;
  created_at: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadClients() {
    setLoading(true);
    const res = await fetch("/api/admin/clients");
    const json = await res.json();
    setClients(json.clients || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold">Clients Overview</h1>
        <p className="opacity-90">Manage all registered companies and license limits</p>
      </div>

      {loading && <p className="text-slate-600">Loading...</p>}

      {!loading && clients.length === 0 && (
        <p className="text-slate-500">No clients found.</p>
      )}

      {!loading && clients.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-xl font-bold text-slate-900">{c.companyName}</h2>
              <p className="text-sm text-slate-600">{c.email}</p>

              <p className="mt-3 text-slate-700">
                <strong>Total Licenses:</strong>{" "}
                <span className="text-emerald-700 font-bold">{c.totalLicenses}</span>
              </p>

              <Link
                href={`/admin/clients/${c.id}`}
                className="inline-block mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
