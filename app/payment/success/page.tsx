'use client';

import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 max-w-lg text-center">
        <h1 className="text-4xl font-black text-teal-800 mb-4">Payment Successful</h1>

        <p className="text-gray-700 text-lg mb-6">
          Thank you! Your payment has been confirmed.
        </p>

        <p className="text-gray-700 mb-6">
          <strong>Reference:</strong> {reference}
        </p>

        <p className="text-gray-700 mb-6">
          You can now submit your License Request Key for activation.
        </p>

        <a
          href="/dashboard/license"
          className="bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
        >
          Go to License Activation
        </a>
      </div>
    </div>
  );
}
