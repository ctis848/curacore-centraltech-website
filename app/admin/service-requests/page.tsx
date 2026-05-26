"use client";

import { useEffect, useState } from "react";
import { FiEye, FiFileText, FiCreditCard } from "react-icons/fi";

interface ServiceRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
  preferredDate: string | null;
  location: string;
  status: string;
  created_at: string;
}

export default function AdminServiceRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/service-request/list", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          setError("Invalid server response. Check admin authentication.");
          return;
        }

        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Unable to load service requests");
          return;
        }

        setRequests(json.data || []);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Network error while loading service requests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          On‑Site Service Requests
        </h1>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

          {/* TOP BAR */}
          <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <span className="font-semibold text-slate-700 text-lg">
              Total Requests: {requests.length}
            </span>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="p-10 text-center text-slate-500 animate-pulse">
              Loading service requests...
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="p-10 text-center text-red-500 font-semibold">
              {error}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && requests.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No service requests yet.
            </div>
          )}

          {/* TABLE */}
          {!loading && !error && requests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Preferred Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {r.companyName}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">{r.contactName}</div>
                        <div className="text-xs text-slate-500">{r.email}</div>
                        <div className="text-xs text-slate-500">{r.phone}</div>
                      </td>

                      <td className="px-4 py-3">{r.serviceType}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            r.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {r.preferredDate
                          ? new Date(r.preferredDate).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="line-clamp-3 text-slate-700">
                          {r.description}
                        </div>
                      </td>

                      <td className="px-4 py-3 space-y-1">

                        {/* VIEW DETAILS */}
                        <a
                          href={`/admin/service-requests/${r.id}`}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
                        >
                          <FiEye size={14} /> View
                        </a>

                        {/* PROFORMA */}
                        <a
                          href={`/admin/service-requests/${r.id}/proforma`}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-semibold transition"
                        >
                          <FiFileText size={14} /> Proforma
                        </a>

                        {/* INVOICE */}
                        <a
                          href={`/admin/service-requests/${r.id}/invoice`}
                          className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-semibold transition"
                        >
                          <FiCreditCard size={14} /> Invoice
                        </a>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
