"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(5, "Message is too short"),
  honeypot: z.string().optional(),
  timestamp: z.number(),
});

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Track when the user opened the form
  const startTime = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      honeypot: (form.elements.namedItem("honeypot") as HTMLInputElement)?.value,
      timestamp: Date.now(), // FIXED: backend expects real timestamp
    };

    // 🛑 Frontend spam protection (must take at least 1.5 seconds)
    if (Date.now() - startTime.current < 1500) {
      setLoading(false);
      return toast.error("Slow down and try again.");
    }

    // 🛑 Validate with Zod
    const validation = ContactSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    // 📡 Send to API
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
      startTime.current = Date.now(); // Reset timer
    } else {
      toast.error(data.error || "Failed to send message");
    }
  }

  return (
    <>
      <div className="pt-32 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6 w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            {/* Honeypot */}
            <input type="text" name="honeypot" className="hidden" tabIndex={-1} />

            {/* Name */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <input
                name="name"
                placeholder="John Doe"
                required
                className="w-full border p-3 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </motion.div>

            {/* Email */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Your Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full border p-3 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </motion.div>

            {/* Message */}
            <motion.div whileFocus={{ scale: 1.02 }}>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Your Message
              </label>
              <textarea
                name="message"
                placeholder="How can we help you?"
                required
                className="w-full border p-3 rounded-md h-32 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </motion.div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm w-full"
          >
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
              Message Sent!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you for contacting CTIS. We will get back to you shortly.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
