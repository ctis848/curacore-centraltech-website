"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Toast from "@/components/Toast";

interface CompanyDetails {
  id: string;
  name: string;
  annual_price: number;
  renewal_date: string | null;
  license_count: number;
}

export default function RenewalDetailsPage() {
  const params = useParams() as { id: string };
  const id = params.id;

  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const emailPreviewRef = useRef<HTMLDialogElement | null>(null);

  const showSuccess = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // ⭐ Determine renewal status
  const getStatus = (date: string | null) => {
    if (!date) return { label: "Unknown", class: "bg-gray-200 text-gray-700" };

    const now = new Date();
    const exp = new Date(date);
    const diff = exp.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 3 && days >= 0)
      return { label: "Due in 3 days", class: "bg-red-100 text-red-700" };

    if (days <= 7 && days > 3)
      return { label: "Due in 7 days", class: "bg-orange-100 text-orange-700" };

    if (days <= 30 && days > 7)
      return { label: "Due in 30 days", class: "bg-yellow-100 text-yellow-700" };

    if (days < 0)
      return { label: "Expired", class: "bg-red-200 text-red-800" };

    return { label: `${days} days left`, class: "bg-green-100 text-green-700" };
  };

  // ⭐ Load company details
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/renewals/${id}`);
        const json = await res.json();
        setCompany(json.data || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!company) return <div className="p-6">Company not found.</div>;

  const status = getStatus(company.renewal_date);

  // ⭐ Send reminder
  const handleSendReminder = async () => {
    const res = await fetch("/api/admin/renewals/notify-company", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    showSuccess(json.message || "Reminder sent successfully");
  };

  // ⭐ Export CSV
  const handleExport = () => {
    const rows = [
      ["Field", "Value"],
      ["Company", company.name],
      ["Annual Price", company.annual_price],
      ["Renewal Date", company.renewal_date ?? "Unknown"],
      ["License Count", company.license_count],
      ["Status", status.label],
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${company.name}-renewal.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">

      {/* TITLE */}
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          {company.name}
        </h1>

        <span
          className={`inline-block mt-3 px-3 py-1 rounded-lg text-sm font-semibold ${status.class}`}
        >
          {status.label}
        </span>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border space-y-4">
        <p className="text-lg">
          <strong>Annual Price:</strong>{" "}
          ₦{Number(company.annual_price).toLocaleString()}
        </p>

        <p className="text-lg">
          <strong>Renewal Date:</strong>{" "}
          {company.renewal_date
            ? new Date(company.renewal_date).toLocaleDateString()
            : "Unknown"}
        </p>

        <p className="text-lg">
          <strong>License Count:</strong> {company.license_count}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => emailPreviewRef.current?.showModal()}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Preview Email
        </button>

        <button
          onClick={handleSendReminder}
          className="px-5 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700"
        >
          Send Reminder
        </button>

        <button
          onClick={handleExport}
          className="px-5 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
        >
          Export CSV
        </button>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      <dialog
        ref={emailPreviewRef}
        className="rounded-xl p-6 shadow-2xl max-w-lg w-full border"
      >
        <h2 className="text-xl font-bold mb-4">Email Preview</h2>

        <div className="space-y-3 text-sm leading-relaxed">
          <p>Hello {company.name},</p>

          <p>
            Your renewal is due on{" "}
            <strong>
              {company.renewal_date
                ? new Date(company.renewal_date).toLocaleDateString()
                : "Unknown"}
            </strong>
            .
          </p>

          <p>Please renew to avoid service interruption.</p>
        </div>

        <button
          onClick={() => emailPreviewRef.current?.close()}
          className="mt-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          Close
        </button>
      </dialog>

      {/* TOAST */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
