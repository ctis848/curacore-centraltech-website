"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Toast from "../../../../components/Toast";
 // ✅ FINAL FIXED PATH

interface CompanyDetails {
  id: string;
  name: string;
  annual_price: number;
  renewal_date: string | null;
  license_count: number;
  status?: string;
  statusLabel?: string;
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
  if (!company) return <div className="p-6">Not found.</div>;

  const statusClass =
    company.status === "expired"
      ? "bg-red-100 text-red-700"
      : company.status === "due"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  const handleSendReminder = async () => {
    const res = await fetch("/api/admin/renewals/notify-company", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    showSuccess(json.message || "Reminder sent successfully");
  };

  const handleExport = () => {
    const rows = [
      ["Field", "Value"],
      ["Company", company.name],
      ["Annual Price", company.annual_price],
      ["Renewal Date", company.renewal_date ?? "Unknown"],
      ["License Count", company.license_count],
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">{company.name}</h1>

      <span
        className={`px-3 py-1 rounded-lg text-sm font-semibold ${statusClass}`}
      >
        {company.statusLabel ?? "Status"}
      </span>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border">
        <p>
          <strong>Annual Price:</strong>{" "}
          ₦{Number(company.annual_price).toLocaleString()}
        </p>
        <p>
          <strong>Renewal Date:</strong>{" "}
          {company.renewal_date
            ? new Date(company.renewal_date).toLocaleDateString()
            : "Unknown"}
        </p>
        <p>
          <strong>License Count:</strong> {company.license_count}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => emailPreviewRef.current?.showModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Preview Email
        </button>

        <button
          onClick={handleSendReminder}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg"
        >
          Send Reminder
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Export to Excel
        </button>
      </div>

      <dialog
        ref={emailPreviewRef}
        className="rounded-xl p-6 shadow-xl max-w-lg w-full"
      >
        <h2 className="text-xl font-bold mb-4">Email Preview</h2>
        <div className="space-y-3 text-sm">
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
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg"
        >
          Close
        </button>
      </dialog>

      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
