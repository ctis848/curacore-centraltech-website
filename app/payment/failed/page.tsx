'use client';

import { useSearchParams } from 'next/navigation';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-red-300 max-w-lg text-center">
        <h1 className="text-4xl font-black text-red-700 mb-4">Payment Failed</h1>

        <p className="text-gray-700 text-lg mb-6">
          Your payment could not be completed.
        </p>

        {reference && (
          <p className="text-gray-700 mb-6">
            <strong>Reference:</strong> {reference}
          </p>
        )}

        <p className="text-gray-700 mb-6">
          Please try again or contact support if the issue persists.
        </p>

        <a
          href="/buy"
          className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
