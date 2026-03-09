'use client';

import { useState } from 'react';

export default function RequestQuotePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget; // ✔ Correctly typed form element
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      form.reset(); // ✔ Now TypeScript is happy
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16 flex justify-center">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg border">

        <h1 className="text-3xl font-black text-teal-900 mb-6 text-center">
          Request a Quote
        </h1>

        {success && (
          <p className="text-green-600 text-center mb-4 font-semibold">
            Your request has been submitted!
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-teal-900 font-semibold mb-1">Full Name</label>
            <input
              name="name"
              required
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-teal-900 font-semibold mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-teal-900 font-semibold mb-1">Hospital / Organization</label>
            <input
              name="organization"
              required
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-teal-900 font-semibold mb-1">What do you need?</label>
            <textarea
              name="details"
              required
              rows={5}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-teal-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-teal-500 transition"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>

        </form>
      </div>
    </div>
  );
}
