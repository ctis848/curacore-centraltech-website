'use client';

import { useState } from 'react';

export default function LicenseActivationPage() {
  const [requestKey, setRequestKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submitRequest() {
    setLoading(true);

    const res = await fetch('/api/license-request', {
      method: 'POST',
      body: JSON.stringify({ requestKey }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessage('Your license request has been submitted. Our team will respond shortly.');
    } else {
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-black text-teal-800 mb-8">License Activation</h1>

      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 space-y-6">
        <label className="block text-teal-800 font-semibold">Paste License Request Key</label>

        <textarea
          rows={6}
          value={requestKey}
          onChange={(e) => setRequestKey(e.target.value)}
          className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
        />

        <button
          onClick={submitRequest}
          disabled={loading}
          className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>

        {message && <p className="text-center text-gray-700 mt-4">{message}</p>}
      </div>
    </div>
  );
}
