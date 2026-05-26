"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function AdminServiceRequestView() {
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/service-request/get?id=${id}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          setError("Invalid server response. Check admin authentication.");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Request not found");
          return;
        }

        setRequest(json.data);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-500 animate-pulse">
        Loading service request...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        {error || "Request not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-10 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Service Request Details
          </h1>
          <p className="opacity-90 mt-2 text-sm md:text-base">
            Request ID: {request.id}
          </p>
        </div>

        {/* BODY */}
        <div className="p-10 space-y-8">

          {/* STATUS BADGE */}
          <div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                request.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : request.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {request.status.toUpperCase()}
            </span>
          </div>

          {/* COMPANY INFO */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Company Info
            </h2>
            <p><strong>Company:</strong> {request.companyName}</p>
            <p><strong>Contact:</strong> {request.contactName}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.phone}</p>
          </div>

          {/* SERVICE DETAILS */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Service Details
            </h2>
            <p><strong>Type:</strong> {request.serviceType}</p>
            <p><strong>Description:</strong> {request.description}</p>
            <p>
              <strong>Preferred Date:</strong>{" "}
              {request.preferredDate
                ? new Date(request.preferredDate).toLocaleDateString()
                : "Not specified"}
            </p>
            <p><strong>Location:</strong> {request.location}</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-6 flex flex-wrap gap-4">
            <a
              href={`/admin/service-requests/${id}/proforma`}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm md:text-base font-bold shadow-lg hover:scale-[1.02] hover:bg-indigo-700 transition"
            >
              Generate Proforma Invoice
            </a>

            <a
              href={`/admin/service-requests/${id}/invoice`}
              className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm md:text-base font-bold shadow-lg hover:scale-[1.02] hover:bg-green-700 transition"
            >
              Generate Final Invoice
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
