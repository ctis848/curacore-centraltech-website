"use client";

import { useState } from "react";

export default function RequestLicensePage() {
  const [requestKey, setRequestKey] = useState("");
  const [machineId, setMachineId] = useState("");
  const [productName, setProductName] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [loading, setLoading] = useState(false);

  const products = [
    "CentralCore EMR",
    "CentralCore POS",
    "CentralCore HRM",
    "CentralCore Inventory",
    "Other (Specify)",
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const finalProduct =
      productName === "Other (Specify)" ? customProduct : productName;

    const res = await fetch("/api/license-request", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestKey,
        machineId,
        productName: finalProduct,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to send license request");
      return;
    }

    alert("License request sent successfully.");
    setRequestKey("");
    setMachineId("");
    setProductName("");
    setCustomProduct("");
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Request License</h1>

      <form
        onSubmit={submit}
        className="space-y-4 bg-white p-5 rounded-lg shadow"
      >
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Product
          </label>
          <select
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            required
          >
            <option value="">Choose a product</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Product Name */}
        {productName === "Other (Specify)" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Enter Product Name
            </label>
            <input
              value={customProduct}
              onChange={(e) => setCustomProduct(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              placeholder="Type product name"
              required
            />
          </div>
        )}

        {/* Request Key */}
        <div>
          <label className="block text-sm font-medium mb-1">Request Key</label>
          <input
            value={requestKey}
            onChange={(e) => setRequestKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-mono"
            placeholder="Paste the machine-generated request key"
            required
          />
        </div>

        {/* Machine ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Machine ID</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white"
            placeholder="Enter machine ID"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send License Request"}
        </button>
      </form>
    </div>
  );
}
