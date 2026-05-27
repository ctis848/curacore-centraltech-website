"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const PRODUCT_PLANS = ["Starter", "Pro", "Enterprise"];

// ⭐ MACHINE KEY VALIDATION
function isValidMachineKey(value: string) {
  // Accept ONLY:
  // - A–Z
  // - 0–9
  // - Dashes
  // - Minimum 10 chars (adjust if needed)
  const regex = /^[A-Z0-9\-]{10,300}$/;
  return regex.test(value.trim());
}

export default function ClientLicenseRequestPage() {
  const supabase = supabaseBrowser();

  const [requestKey, setRequestKey] = useState("");
  const [notes, setNotes] = useState("");
  const [productName, setProductName] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<null | { type: "error" | "success"; text: string }>(null);

  // AUTO‑LOAD EMAIL + COMPANY NAME
  useEffect(() => {
    async function loadUserInfo() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      setUserEmail(session.user.email ?? "");

      const userId = session.user.id;

      const { data: membership } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!membership?.company_id) return;

      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", membership.company_id)
        .maybeSingle();

      setCompanyName(company?.name ?? "");
    }

    loadUserInfo();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!productName) {
      setMsg({ type: "error", text: "Please select a Product Plan." });
      return;
    }

    if (!requestKey.trim()) {
      setMsg({ type: "error", text: "Please paste your License Request Key." });
      return;
    }

    if (!isValidMachineKey(requestKey)) {
      setMsg({
        type: "error",
        text: "Invalid License Request Key format. Only A–Z, 0–9, dashes, minimum 10 characters.",
      });
      return;
    }

    if (!companyName.trim()) {
      setMsg({ type: "error", text: "Company name missing." });
      return;
    }

    if (!userEmail.trim()) {
      setMsg({ type: "error", text: "Email missing." });
      return;
    }

    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMsg({ type: "error", text: "You must be logged in." });
      setSaving(false);
      return;
    }

    const userId = session.user.id;

    const res = await fetch("/api/client/license-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userEmail,
        companyName,
        productName,
        requestKey: requestKey.trim(),
        notes: notes || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg({ type: "error", text: data.error || "Failed to send license request." });
      setSaving(false);
      return;
    }

    setMsg({ type: "success", text: "License request sent successfully." });
    setRequestKey("");
    setNotes("");
    setProductName("");
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Send License Request Key
      </h1>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6"
      >
        {/* AUTO‑FILLED EMAIL */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Your Email</label>
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg bg-slate-100 shadow-sm"
            value={userEmail}
            readOnly
          />
        </div>

        {/* AUTO‑FILLED COMPANY NAME */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Company Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg bg-slate-100 shadow-sm"
            value={companyName}
            readOnly
          />
        </div>

        {/* PRODUCT PLAN */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Product Plan</label>
          <select
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          >
            <option value="">Select a product plan...</option>
            {PRODUCT_PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* REQUEST KEY */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            License Request Key (from your machine)
          </label>

          <textarea
            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 ${
              requestKey && !isValidMachineKey(requestKey)
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-purple-400"
            }`}
            rows={5}
            value={requestKey}
            onChange={(e) => setRequestKey(e.target.value.toUpperCase())}
            placeholder="Paste the License Request Key generated by your machine..."
          />

          {requestKey && !isValidMachineKey(requestKey) && (
            <p className="text-red-600 text-sm mt-1">
              Invalid machine key format. Only A–Z, 0–9, dashes, minimum 10 characters.
            </p>
          )}
        </div>

        {/* NOTES */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Notes (optional)</label>
          <textarea
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra info for admin..."
          />
        </div>

        {/* MESSAGE */}
        {msg && (
          <p
            className={`text-sm font-semibold p-3 rounded-lg ${
              msg.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {msg.text}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition transform active:scale-95 ${
            saving
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:brightness-110"
          }`}
        >
          {saving ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
