"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Toast from "@/components/Toast";

interface ReminderHistory {
  id: string;
  days_left: number;
  sent_at: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  renewal_date: string | null;
  annual_amount: number;
  email: string;
  portal_password: string | null;
  created_at: string;
  daysLeft: number;
  renewalState: string;
  canSendReminder: boolean;
}

export default function RenewalDetailsPage() {
  const params = useParams() as { id: string };
  const id = params.id;

  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [history, setHistory] = useState<ReminderHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const emailPreviewRef = useRef<HTMLDialogElement | null>(null);

  const showSuccess = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // ⭐ Load company details
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/renewals/${id}`);
        const json = await res.json();

        if (json.success) {
          setCompany(json.company);
          setHistory(json.history || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!company) return <div className="p-6">Company not found.</div>;

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
      ["Annual Amount", company.annual_amount],
      ["Renewal Date", company.renewal_date ?? "Unknown"],
      ["Days Left", company.daysLeft],
      ["Status", company.renewalState],
      ["Email", company.email],
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
          className={`inline-block mt-3 px-3 py-1 rounded-lg text-sm font-semibold ${
            company.renewalState.includes("Expired")
              ? "bg-red-200 text-red-800"
              : company.renewalState.includes("3 days")
              ? "bg-red-100 text-red-700"
              : company.renewalState.includes("7 days")
              ? "bg-orange-100 text-orange-700"
              : company.renewalState.includes("30 days")
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {company.renewalState}
        </span>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border space-y-4">
        <p className="text-lg">
          <strong>Annual Amount:</strong>{" "}
          ₦{Number(company.annual_amount).toLocaleString()}
        </p>

        <p className="text-lg">
          <strong>Renewal Date:</strong>{" "}
          {company.renewal_date
            ? new Date(company.renewal_date).toLocaleDateString()
            : "Unknown"}
        </p>

        <p className="text-lg">
          <strong>Days Left:</strong> {company.daysLeft}
        </p>

        <p className="text-lg">
          <strong>Email:</strong> {company.email}
        </p>

        <p className="text-lg">
          <strong>Portal Password:</strong>{" "}
          {company.portal_password || "******"}
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

        {company.canSendReminder && (
          <button
            onClick={handleSendReminder}
            className="px-5 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700"
          >
            Send Reminder
          </button>
        )}

        <button
          onClick={handleExport}
          className="px-5 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
        >
          Export CSV
        </button>
      </div>

      {/* REMINDER HISTORY */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border">
        <h2 className="text-xl font-bold mb-4">Reminder History</h2>

        {history.length === 0 ? (
          <p className="text-slate-600">No reminders sent yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Days Left</th>
                <th className="p-3 text-left">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b">
                  <td className="p-3">{h.days_left}</td>
                  <td className="p-3">
                    {new Date(h.sent_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
            Your subscription will expire in{" "}
            <strong>{company.daysLeft} days</strong>.
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
