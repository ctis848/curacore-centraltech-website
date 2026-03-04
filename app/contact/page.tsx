"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const phone = "2348012345678"; // your WhatsApp number
    const text = encodeURIComponent(
      `Hello CTIS,
My name is ${name}.
My email is ${email}.
Message: ${message}`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="p-3 border rounded w-full" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input className="p-3 border rounded w-full" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <textarea className="p-3 border rounded w-full" placeholder="Message" onChange={(e) => setMessage(e.target.value)} />
      <button className="bg-green-600 text-white px-6 py-3 rounded">Send via WhatsApp</button>
    </form>
  );
}
