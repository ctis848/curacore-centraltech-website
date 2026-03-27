"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion"; // ✅ Added

const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(5, "Message is too short"),
});

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    const validation = ContactSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success("Message sent!");
      setShowModal(true);
      form.reset();
    } else {
      toast.error("Failed to send message");
    }
  }

  return (
    <>
      {/* PAGE TRANSITION ANIMATION WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}     // fade + slide up
        animate={{ opacity: 1, y: 0 }}       // final state
        transition={{ duration: 0.5 }}       // smooth timing
        className="w-full"
      >
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto p-4">
          <input
            name="name"
            placeholder="Your Name"
            required
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            required
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            className="w-full border p-3 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3">Message Sent!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for contacting CTIS. We will get back to you shortly.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
