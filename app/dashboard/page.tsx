// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PaystackButton } from 'react-paystack';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [license, setLicense] = useState<any>(null);
  const [licenseRequest, setLicenseRequest] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState<number | null>(null);
  const [annualFee, setAnnualFee] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setSubscription(sub);

      if (sub) {
        setAnnualFee(sub.annual_service_fee || 100000); // fallback

        const expiry = new Date(sub.expiry);
        const now = new Date();
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setExpiryDays(days > 0 ? days : 0);

        if (days <= 0) {
          setMessage('Your subscription has expired. Licenses are deactivated. Renew to reactivate.');
          await supabase
            .from('licenses')
            .update({ active: false })
            .eq('user_id', user.id);
        }
      }

      // Fetch license
      const { data: lic } = await supabase
        .from('enterprise_licenses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setLicense(lic);
    };

    loadData();
  }, []);

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          requestCode: licenseRequest,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Activation failed');

      setLicense(result.license);
      setStatus('success');
      setMessage('License activated successfully!');
      setLicenseRequest('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to activate');
    }
  };

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || '',
    amount: annualFee * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    metadata: {
      user_id: user?.id,
      purpose: 'annual_service_fee',
      license_id: license?.id,
    },
  };

  const handleRenewalSuccess = async (response: any) => {
    try {
      const res = await fetch('/api/payments/renew-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: response.reference,
          userId: user?.id,
        }),
      });

      if (!res.ok) throw new Error('Renewal failed');

      setMessage('Service fee renewed! License extended.');
      window.location.reload();
    } catch (err) {
      setMessage('Renewal failed. Contact support.');
    }
  };

  const isEnterprise = subscription?.plan === 'Enterprise';
  const isExpired = expiryDays !== null && expiryDays <= 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Please log in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-900 mb-10 text-center">
          Your CentralCore Dashboard
        </h1>

        {/* Subscription Status */}
        <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
          <h2 className="text-3xl font-bold text-teal-900 mb-6">Subscription Status</h2>
          {subscription ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xl mb-2">
                  <span className="font-semibold">Plan:</span> {subscription.plan}
                </p>
                <p className="text-xl">
                  <span className="font-semibold">Expiry:</span>{' '}
                  {new Date(subscription.expiry).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xl mb-2">
                  <span className="font-semibold">Days Remaining:</span>{' '}
                  <span className={isExpired ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    {expiryDays !== null ? `${expiryDays} days` : 'N/A'}
                  </span>
                </p>
                {isExpired && (
                  <div className="mt-4 p-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium text-lg">
                      Subscription expired. Licenses deactivated.
                    </p>
                    <p className="mt-2 text-red-600">
                      Renew annual service fee to reactivate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xl text-gray-600">
              No active subscription. Subscribe to continue.
            </p>
          )}
        </section>

        {/* License Section */}
        <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
          <h2 className="text-3xl font-bold text-teal-900 mb-6">License Management</h2>
          {license ? (
            <div className="bg-teal-50 p-6 rounded-xl">
              <p className="text-xl font-semibold mb-3">Active License Key</p>
              <div className="bg-white p-5 rounded-lg border border-teal-200 font-mono text-lg break-all mb-4">
                {license.license_key}
              </div>
              <p className="text-lg">
                Valid until: <strong>{new Date(license.service_expiry).toLocaleDateString()}</strong>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-6 text-gray-700">
                No active license. Paste request code to activate.
              </p>
              <form onSubmit={handleActivateLicense} className="space-y-6">
                <textarea
                  value={licenseRequest}
                  onChange={(e) => setLicenseRequest(e.target.value)}
                  placeholder="Paste License Request code from CentralCore software..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[160px]"
                  required
                  disabled={isExpired}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || isExpired}
                  className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
                    status === 'loading' || isExpired
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {status === 'loading' ? 'Activating...' : 'Activate License'}
                </button>
              </form>
              {status === 'error' && <p className="text-red-600 mt-6 text-lg">{message}</p>}
              {status === 'success' && <p className="text-green-600 mt-6 text-lg">{message}</p>}
            </div>
          )}
        </section>

        {/* Renewal Section */}
        {isEnterprise && (
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
            <h2 className="text-3xl font-bold text-teal-900 mb-6">Renew Annual Service Fee</h2>
            <p className="text-lg mb-6">
              Next due: {new Date(subscription?.expiry || '').toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-8">
              Amount: <strong>₦{annualFee.toLocaleString()}</strong> (20% of license fee)
            </p>
            <PaystackButton
              {...paystackConfig}
              text={`Renew - ₦${annualFee.toLocaleString()}`}
              onSuccess={handleRenewalSuccess}
              onClose={() => setMessage('Payment cancelled.')}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all"
            />
            {message && (
              <p className={`mt-6 text-lg ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}