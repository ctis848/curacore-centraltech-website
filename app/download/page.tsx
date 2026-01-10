// app/download/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send email to your backend (e.g., Supabase or email service)
    console.log('Subscribed:', email);
    setSubmitted(true);
    setEmail('');
  };

  const versions = [
    {
      name: 'Demo - 30 Day Trial',
      description: 'Try all features free for 30 days - no credit card needed',
      users: 'Up to 5 users',
      buttonText: 'Download Demo (Coming Soon)',
      available: false,
    },
    {
      name: 'Starter',
      description: 'Perfect for small clinics - basic features to get started',
      users: '5 Users',
      buttonText: 'Download Starter (Coming Soon)',
      available: false,
    },
    {
      name: 'Pro',
      description: 'Advanced tools for growing hospitals - full integration suite',
      users: '25 Users',
      buttonText: 'Download Pro (Coming Soon)',
      available: false,
    },
    {
      name: 'Enterprise',
      description: 'Unlimited scale for large institutions - custom support included',
      users: 'Unlimited Users',
      buttonText: 'Download Enterprise (Coming Soon)',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-12 text-center">
          Download CentralCore EMR
        </h1>
        <p className="text-xl text-gray-700 mb-16 text-center max-w-3xl mx-auto">
          Choose your version below. All apps are secure, easy to install, and optimized for Windows/Mac/Linux. We're finalizing the downloads — join the waitlist to get notified first!
        </p>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {versions.map((v) => (
            <div
              key={v.name}
              className="p-8 rounded-3xl shadow-2xl bg-white border-4 border-teal-200 hover:border-yellow-400 transition-all duration-300"
            >
              <h3 className="text-3xl font-bold text-teal-900 mb-4">{v.name}</h3>
              <p className="text-gray-700 mb-4">{v.description}</p>
              <p className="text-lg font-medium text-teal-700 mb-6">Users: {v.users}</p>
              <button
                onClick={() => alert('Coming soon — we\'re working hard on this! Join the waitlist below to get notified.')}
                className="w-full bg-yellow-400 text-teal-900 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition shadow-lg"
              >
                {v.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Waitlist Form */}
        <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-2xl border-4 border-teal-200">
          <h2 className="text-4xl font-black text-teal-900 mb-6">
            Join the Waitlist
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Be the first to know when downloads are ready. Enter your email below.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full border-2 border-teal-300 text-lg focus:border-yellow-400 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-yellow-400 text-teal-900 px-12 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition"
            >
              Subscribe
            </button>
          </form>
          {submitted && (
            <p className="mt-4 text-green-600 font-medium">
              Thanks! You're on the list — we'll notify you soon.
            </p>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/support" className="text-teal-900 text-lg font-medium hover:underline">
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}