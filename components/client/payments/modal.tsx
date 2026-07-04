"use client";

import React from "react";

export default function PaymentModal({
  payment,
  onClose,
}: {
  payment: any;
  onClose: () => void;
}) {
  if (!payment) return null;

  // ----------------------------------------------------
  // ICONS BY PURPOSE
  // ----------------------------------------------------
  function getIcon() {
    const p = (payment.purpose || "").toLowerCase();

    if (p.includes("service")) return "🛠️";
    if (p.includes("renewal")) return "🔄";
    if (p.includes("license")) return "🔑";
    if (p.includes("activation")) return "⚡";
    return "💳";
  }

  // ----------------------------------------------------
  // COLOR BY PURPOSE
  // ----------------------------------------------------
  function getPurposeColor() {
    const p = (payment.purpose || "").toLowerCase();

    if (p.includes("service")) return "bg-blue-100 border-blue-300 text-blue-900";
    if (p.includes("renewal")) return "bg-green-100 border-green-300 text-green-900";
    if (p.includes("license")) return "bg-purple-100 border-purple-300 text-purple-900";
    if (p.includes("activation")) return "bg-orange-100 border-orange-300 text-orange-900";
    return "bg-slate-100 border-slate-300 text-slate-900";
  }

  // ----------------------------------------------------
  // DOWNLOAD RECEIPT PDF (client-side)
  // ----------------------------------------------------
  function downloadPDF() {
    const content = `
      Payment Receipt
      -------------------------
      Purpose: ${payment.purpose}
      Amount: ₦${Number(payment.amount).toLocaleString()}
      Status: ${payment.status}
      Reference: ${payment.reference}
      Gateway: ${payment.gateway}
      Date: ${payment.created_at}
      Client ID: ${payment.client_id}
      User ID: ${payment.userid}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.reference}.txt`;
    a.click();
  }

  // ----------------------------------------------------
  // PRINT RECEIPT
  // ----------------------------------------------------
  function printReceipt() {
    const printContent = `
      <h2>Payment Receipt</h2>
      <p><strong>Purpose:</strong> ${payment.purpose}</p>
      <p><strong>Amount:</strong> ₦${Number(payment.amount).toLocaleString()}</p>
      <p><strong>Status:</strong> ${payment.status}</p>
      <p><strong>Reference:</strong> ${payment.reference}</p>
      <p><strong>Gateway:</strong> ${payment.gateway}</p>
      <p><strong>Date:</strong> ${payment.created_at}</p>
      <p><strong>Client ID:</strong> ${payment.client_id}</p>
      <p><strong>User ID:</strong> ${payment.userid}</p>
    `;

    const win = window.open("", "PRINT", "height=600,width=800");
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  }

  // ----------------------------------------------------
  // SHARE RECEIPT VIA EMAIL
  // ----------------------------------------------------
  async function shareEmail() {
    await fetch("/api/email/share-receipt", {
      method: "POST",
      body: JSON.stringify({
        reference: payment.reference,
        amount: payment.amount,
        purpose: payment.purpose,
        date: payment.created_at,
      }),
    });

    alert("Receipt sent to your email.");
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {getIcon()} Payment Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Purpose */}
        <div className={`p-4 rounded-lg border ${getPurposeColor()}`}>
          <p className="text-sm font-semibold">Purpose</p>
          <p className="text-lg font-bold">{payment.purpose || "—"}</p>
        </div>

        {/* Payment Info */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Amount:</span>
            <span className="text-slate-900 font-bold">
              ₦{Number(payment.amount).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                (payment.status || "").toLowerCase() === "success"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {payment.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Reference:</span>
            <span className="font-mono break-all text-slate-900">
              {payment.reference}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Gateway:</span>
            <span className="text-slate-900 font-semibold">
              {payment.gateway || "paystack"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Date:</span>
            <span className="text-slate-900">
              {payment.created_at
                ? new Date(payment.created_at).toLocaleString()
                : "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Client ID:</span>
            <span className="font-mono text-slate-900">
              {payment.client_id || "—"}
            </span>
          </div>

          {payment.userid && (
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">User ID:</span>
              <span className="font-mono text-slate-900">
                {payment.userid}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={downloadPDF}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg shadow-md"
          >
            Download Receipt
          </button>

          <button
            onClick={printReceipt}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md"
          >
            Print Receipt
          </button>

          <button
            onClick={shareEmail}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
          >
            Share via Email
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
