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
  timestamp: z.number().optional(),
});

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const startTime = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      honeypot: (form.elements.namedItem("honeypot") as HTMLInputElement)?.value,
      timestamp: Date.now() - startTime.current,
    };

    // SPAM PROTECTION
    if (formData.honeypot) {
      setLoading(false);
      return;
    }

    if (formData.timestamp < 1500) {
      setLoading(false);
      return toast.error("Slow down and try again.");
    }

    const validation = ContactSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    // ⭐ GET USER IP ADDRESS
    let ip = "Unknown";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      ip = ipData.ip;
    } catch {
      ip = "Unavailable";
    }

    // ⭐ SAFE PUBLIC BREVO KEY
    const BREVO_KEY = process.env.NEXT_PUBLIC_BREVO_PUBLIC_KEY!;
    const WHATSAPP = "https://wa.me/2348059318564?text=Hello%20CTIS";

    // ⭐ EMAIL TEMPLATES
    const adminTemplate = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Message:</strong><br>${formData.message}</p>
      <hr />
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    const userTemplate = `
      <p>Hello ${formData.name},</p>
      <p>Thank you for contacting CTIS. We have received your message and will respond shortly.</p>
      <br />
      <p><strong>Your Message:</strong></p>
      <p>${formData.message}</p>
      <br />
      <p>Best regards,<br/>CTIS Support Team</p>
    `;

    try {
      // ⭐ SEND TO CTIS TEAM (ADMIN)
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_KEY,
        },
        body: JSON.stringify({
          sender: { email: "no-reply@ctistech.com", name: "CTIS Website" },
          to: [{ email: "info@ctistech.com" }],
          replyTo: { email: formData.email },
          subject: `New Contact Message from ${formData.name}`,
          htmlContent: adminTemplate,
        }),
      });

      // ⭐ AUTO‑REPLY TO USER
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_KEY,
        },
        body: JSON.stringify({
          sender: { email: "no-reply@ctistech.com", name: "CTIS Support" },
          to: [{ email: formData.email }],
          subject: "We received your message",
          htmlContent: userTemplate,
        }),
      });

      toast.success("Message sent!");
      setShowModal(true);
      form.reset();
      startTime.current = Date.now();

    } catch (error) {
      console.error("BREVO ERROR:", error);
      toast.error("Email failed. Please contact us on WhatsApp: 08059318564");
    }

    setLoading(false);
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
            <input type="text" name="honeypot" className="hidden" tabIndex={-1} />

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
