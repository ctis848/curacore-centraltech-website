"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import ContactSuccessModal from "./ContactSuccessModal";
import { motion } from "framer-motion";

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
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-lg mx-auto p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.input
          name="name"
          placeholder="Your Name"
          required
          className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          whileFocus={{ scale: 1.02 }}
        />

        <motion.input
          name="email"
          type="email"
          placeholder="Your Email"
          required
          className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          whileFocus={{ scale: 1.02 }}
        />

        <motion.textarea
          name="message"
          placeholder="Your Message"
          required
          className="w-full border p-3 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none"
          whileFocus={{ scale: 1.02 }}
        />

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          whileTap={{ scale: 0.97 }}
        >
          {loading ? "Sending..." : "Send Message"}
        </motion.button>
      </motion.form>

      <ContactSuccessModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
