"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: any = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const body = new FormData();
    body.append("name", form.name);
    body.append("email", form.email);
    body.append("message", form.message);
    if (file) body.append("file", file);

    const res = await fetch("/api/contact", {
      method: "POST",
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Server error");
      setLoading(false);
      return;
    }

    toast.success("Message sent successfully");
    window.location.href = "/contact/success";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef7ff] via-white to-[#e8f5f3] pt-32 pb-20 px-6">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f1a2b]">
          Contact <span className="text-emerald-600">CentralCore</span>
        </h1>
        <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
          We’re here to support your healthcare transformation.  
          Reach out and our team will respond promptly.
        </p>
      </motion.div>

      {/* Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl p-10 rounded-3xl border border-gray-200 space-y-8"
      >
        {/* Name */}
        <div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all outline-none bg-white
              ${errors.name ? "border-red-500" : "border-gray-300 focus:border-emerald-600"}
            `}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-all outline-none bg-white
              ${errors.email ? "border-red-500" : "border-gray-300 focus:border-emerald-600"}
            `}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Message */}
        <div>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border h-36 transition-all outline-none resize-none bg-white
              ${errors.message ? "border-red-500" : "border-gray-300 focus:border-emerald-600"}
            `}
            placeholder="Write your message here..."
          />
          {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700">Attachment (optional)</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-600"
            />
            {file && (
              <span className="text-sm text-emerald-700 font-medium">
                {file.name}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold text-lg shadow-lg
            hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </motion.button>
      </motion.form>
    </div>
  );
}
