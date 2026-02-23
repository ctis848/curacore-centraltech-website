// app/download/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);

    // Simulate API call (replace with real endpoint later)
    await new Promise(resolve => setTimeout(resolve, 1200));

    setSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
  };

  const versions = [
    {
      name: 'Demo - 30 Day Trial',
      description: 'Try all features free for 30 days — no credit card required',
      users: 'Up to 5 users',
      buttonText: 'Download Demo',
      disabled: true,
    },
    {
      name: 'Starter',
      description: 'Perfect for small clinics — essential features to get started',
      users: '5 Users',
      buttonText: 'Download Starter',
      disabled: true,
    },
    {
      name: 'Pro',
      description: 'Advanced tools for growing hospitals — full integration suite',
      users: '25 Users',
      buttonText: 'Download Pro',
      disabled: true,
    },
    {
      name: 'Enterprise',
      description: 'Unlimited scale for large institutions — custom support included',
      users: 'Unlimited Users',
      buttonText: 'Contact Sales',
      disabled: false, // Enterprise usually requires contact
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50 py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-teal-900 mb-6 tracking-tight">
            Download CentralCore EMR
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            Choose your edition below. Secure, easy-to-install apps for Windows, macOS, and Linux. 
            Downloads are being finalized — join the waitlist to get early access!
          </p>
        </div>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20 md:mb-24">
          {versions.map((version) => (
            <div
              key={version.name}
              className="bg-white rounded-3xl shadow-xl border-2 border-teal-100 p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:border-yellow-400 group"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-teal-900 mb-4 text-center">
                {version.name}
              </h3>
              <p className="text-gray-700 mb-6 flex-grow text-center leading-relaxed">
                {version.description}
              </p>
              <p className="text-lg font-medium text-teal-700 mb-8 text-center">
                Users: <span className="font-bold">{version.users}</span>
              </p>

              <button
                disabled={version.disabled}
                onClick={() => {
                  if (version.disabled) {
                    alert('Coming soon — join the waitlist below to get notified first!');
                  } else {
                    // Enterprise contact logic here later
                    window.location.href = '/contact';
                  }
                }}
                className={`
                  mt-auto w-full py-4 px-8 rounded-full text-lg font-bold transition-all duration-300
                  ${version.disabled 
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-400 text-teal-900 hover:bg-yellow-300 hover:shadow-xl active:scale-95 shadow-lg'
                  }
                `}
              >
                {version.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Waitlist Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-teal-100 p-10 md:p-12">
          <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-6 text-center">
            Join the Early Access Waitlist
          </h2>
          <p className="text-xl text-gray-700 mb-10 text-center">
            Be the first to download when ready. Enter your email below — no spam, ever.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-teal-900 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                disabled={isSubmitting || submitted}
                className="w-full px-6 py-5 rounded-xl border-2 border-teal-200 text-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || submitted || !email.trim()}
              className={`
                w-full py-5 px-10 rounded-full text-xl font-bold transition-all duration-300 shadow-lg
                ${isSubmitting 
                  ? 'bg-gray-300 text-gray-600 cursor-wait' 
                  : submitted 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-yellow-400 text-teal-900 hover:bg-yellow-300 hover:shadow-xl active:scale-95'
                }
              `}
            >
              {isSubmitting 
                ? 'Subscribing...' 
                : submitted 
                  ? 'You’re on the list!' 
                  : 'Join Waitlist'}
            </button>
          </form>

          {submitted && (
            <p className="mt-6 text-center text-green-700 font-medium text-lg">
              Thank you! We'll email you as soon as downloads are ready.
            </p>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-16 text-center">
          <Link 
            href="/support" 
            className="text-teal-700 hover:text-teal-900 font-medium text-lg inline-flex items-center gap-2 transition"
          >
            Need help or have questions? → Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}