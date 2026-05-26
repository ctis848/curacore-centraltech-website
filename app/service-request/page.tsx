"use client";

import { useState } from "react";

export default function ServiceRequestPage() {
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

    // Basic validation
    if (
      !form.companyName ||
      !form.contactName ||
      !form.email ||
      !form.phone ||
      !form.serviceType ||
      !form.description ||
      !form.location
    ) {
      alert("Please fill all required fields");
      return;
    }

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

      window.location.href = "/service-request/success";
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-10 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            On‑Site Service Request
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Request installation, troubleshooting, upgrade, or on‑site support
          </p>
        </div>

        {/* FORM BODY */}
        <div className="p-10 space-y-10">

          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Company / Hospital Name *
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              placeholder="Enter company name"
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Contact Person *
            </label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              placeholder="Enter contact name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              placeholder="Enter email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Phone Number *
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              placeholder="Enter phone number"
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Service Type *
            </label>
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
            <label className="text-lg font-semibold text-gray-800">
              Description of Issue / Request *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl h-40"
              placeholder="Describe the issue or service needed"
            />
          </div>

          {/* Preferred Date */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Preferred Date (optional)
            </label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => update("preferredDate", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-800">
              Service Location *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
              placeholder="Enter full address"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={submitRequest}
            disabled={loading}
            className={`w-full py-5 text-xl font-bold rounded-xl text-white transition-all transform hover:scale-[1.02] ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 shadow-lg"
            }`}
          >
            {loading ? "Submitting..." : "Submit Service Request"}
          </button>

        </div>
      </div>
    </div>
  );
}
