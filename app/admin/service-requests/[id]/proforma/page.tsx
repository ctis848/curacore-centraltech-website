"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function ProformaCreatePage() {
  const { id } = useParams() as { id: string };

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<any[]>([
    { name: "", qty: 1, amount: 0 },
  ]);

  const VAT_RATE = 0.075;

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.amount, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/service-request/get?id=${id}`, {
          credentials: "include",
        });

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          setError("Invalid server response. Check admin authentication.");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Unable to load service request");
          return;
        }

        setRequest(json.data);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Network error while loading request");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateItem = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const submitProforma = async () => {
    if (items.some(i => !i.name || i.amount <= 0)) {
      alert("Please fill all item fields correctly.");
      return;
    }

    const res = await fetch("/api/service-request/proforma/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        requestId: id,
        items,
        subtotal,
        vat,
        total,
      }),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      alert("Invalid server response");
      return;
    }

    const json = await res.json();

    if (res.ok) {
      alert("Proforma Invoice Sent Successfully");
      window.location.href = `/admin/service-requests/${id}`;
    } else {
      alert(json.error || "Error creating proforma");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-slate-500 animate-pulse">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-10 text-white">
          <h1 className="text-4xl font-extrabold">Create Proforma Invoice</h1>
          <p className="opacity-90 mt-2 text-lg">{request.companyName}</p>
        </div>

        {/* BODY */}
        <div className="p-10 space-y-10">

          {/* ITEM LIST */}
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-100 p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-fadeIn"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Item {index + 1}</h3>

                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <FiTrash2 size={20} />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, "qty", Number(e.target.value))
                  }
                  className="w-1/3 p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    updateItem(index, "amount", Number(e.target.value))
                  }
                  className="w-2/3 p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
          ))}

          {/* ADD ITEM BUTTON */}
          <button
            onClick={addItem}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.03] hover:bg-indigo-700 transition"
          >
            <FiPlus size={20} /> Add Item
          </button>

          {/* TOTALS */}
          <div className="bg-slate-100 p-6 rounded-xl shadow-sm border border-slate-200 space-y-2 text-lg">
            <p>
              <strong>Subtotal:</strong> ₦{subtotal.toLocaleString()}
            </p>
            <p>
              <strong>VAT (7.5%):</strong> ₦{vat.toLocaleString()}
            </p>
            <p className="text-2xl font-bold text-slate-800">
              <strong>Total:</strong> ₦{total.toLocaleString()}
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={submitProforma}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-xl text-xl font-bold shadow-lg hover:scale-[1.02] transition"
          >
            Send Proforma Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
