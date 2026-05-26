"use client";

import { useState } from "react";

export default function ClientOnSiteSupport() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    serviceType: "",
    description: "",
    preferredDate: "",
    location: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submitRequest() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/service-request/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Unable to submit request");
        setLoading(false);
        return;
      }

      window.location.href = "/client/service-requests";
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-6 flex justify-center">
    <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-10 text-white text-center">
          <h1 className="text-4xl font-extrabold">Request On‑Site Support</h1>
          <p className="mt-4 text-lg opacity-90">
            Submit a request for installation, troubleshooting, or technical support
          </p>
        </div>

        {/* FORM */}
        <div className="p-10 space-y-10">

          {Object.entries({
            companyName: "Company Name",
            contactName: "Contact Person",
            email: "Email Address",
            phone: "Phone Number",
            location: "Service Location",
          }).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <label className="text-lg font-semibold text-gray-800">{label} *</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => update(key, e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              />
            </div>
          ))}

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">Service Type *</label>
            <select
              value={form.serviceType}
              onChange={(e) => update("serviceType", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
            >
              <option value="">Select service type</option>
              <option value="Installation">Installation</option>
              <option value="Troubleshooting">Troubleshooting</option>
              <option value="Training">Training</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Data Migration">Data Migration</option>
              <option value="Network Setup">Network Setup</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl h-40"
            />
          </div>

          {/* Preferred Date */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">Preferred Date</label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => update("preferredDate", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={submitRequest}
            disabled={loading}
            className={`w-full py-5 text-xl font-bold rounded-xl text-white transition-all transform hover:scale-[1.02] ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 shadow-lg"
            }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

        </div>
      </div>
    </div>
  );
}
