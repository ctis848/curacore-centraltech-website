"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiPlus, FiTrash2 } from "react-icons/fi";

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
}

interface InvoiceItem {
  name: string;
  qty: number;
  amount: number;
}

const VAT_RATE = 0.075;

export default function FinalInvoicePage() {
  const { id } = useParams() as { id: string };

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", qty: 1, amount: 0 },
  ]);

  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.amount, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/service-request/get?id=${id}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          setError("Invalid server response");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Request not found");
          return;
        }

        setRequest(json.data);
        if (json.data.status === "paid") setPaid(true);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ⭐ FIXED TYPE ERROR HERE
  const updateItem = <K extends keyof InvoiceItem>(
    index: number,
    key: K,
    value: InvoiceItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", qty: 1, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submitInvoice = async () => {
    if (!request) return;

    if (items.length === 0 || items.some((i) => !i.name || i.amount <= 0)) {
      alert("Please add valid invoice items.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/service-request/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          requestId: id,
          items,
          subtotal,
          vat,
          total,
          paid,
          companyName: request.companyName,
          contactName: request.contactName,
          email: request.email,
          phone: request.phone,
          serviceType: request.serviceType,
          description: request.description,
          location: request.location,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        alert("Invalid server response");
        return;
      }

      const json = await res.json();

      if (res.ok) {
        alert("Final Invoice Saved Successfully");
        window.location.href = `/admin/service-requests/${id}/invoice`;
      } else {
        alert(json.error || "Error creating invoice");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-500 animate-pulse">
        Loading invoice builder...
      </div>
    );

  if (error || !request)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        {error || "Request not found"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 p-10 text-white">
          <h1 className="text-4xl font-extrabold">Final Invoice Builder</h1>
          <p className="opacity-90 mt-2 text-lg">{request.companyName}</p>
        </div>

        {/* BODY */}
        <div className="p-10 space-y-10 text-slate-800">

          {/* REQUEST SUMMARY */}
          <div className="space-y-1 text-sm">
            <p><strong>Contact:</strong> {request.contactName}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.phone}</p>
            <p><strong>Service Type:</strong> {request.serviceType}</p>
            <p><strong>Location:</strong> {request.location}</p>
          </div>

          {/* ITEMS */}
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-100 p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Item {index + 1}</h3>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, "qty", Number(e.target.value))
                  }
                  className="w-1/3 p-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    updateItem(index, "amount", Number(e.target.value))
                  }
                  className="w-2/3 p-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.03] hover:bg-emerald-700 transition"
          >
            <FiPlus size={20} /> Add Item
          </button>

          {/* TOTALS + PAID TOGGLE */}
          <div className="bg-slate-100 p-6 rounded-xl shadow-sm border border-slate-200 space-y-3 text-lg">
            <p><strong>Subtotal:</strong> ₦{subtotal.toLocaleString()}</p>
            <p><strong>VAT (7.5%):</strong> ₦{vat.toLocaleString()}</p>
            <p className="text-2xl font-bold text-slate-900">
              <strong>Total:</strong> ₦{total.toLocaleString()}
            </p>

            <label className="flex items-center gap-3 text-base pt-3">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              Mark as <span className="font-bold">{paid ? "PAID" : "UNPAID"}</span>
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={submitInvoice}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Saving Invoice..." : "Save Final Invoice"}
            </button>

            <a
              href={`/api/invoice/generate?id=${id}${paid ? "&paid=true" : ""}`}
              className="flex-1 bg-slate-800 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:scale-[1.02] hover:bg-slate-900 transition text-center"
            >
              Download {paid ? "Receipt" : "Invoice"} PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
