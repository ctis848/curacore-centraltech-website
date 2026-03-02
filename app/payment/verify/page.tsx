'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    async function verify() {
      if (!reference) {
        setStatus('failed');
        return;
      }

      const res = await fetch(`/api/paystack/verify?reference=${reference}`);
      const data = await res.json();

      if (data?.status === 'success') {
        router.replace(`/payment/success?reference=${reference}`);
      } else {
        router.replace(`/payment/failed?reference=${reference}`);
      }
    }

    verify();
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-teal-800 mb-4">Verifying Payment...</h1>
        <p className="text-gray-700">Please wait while we confirm your transaction.</p>
      </div>
    </div>
  );
}
