// app/portal/dashboard/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [requestKey, setRequestKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/portal/login');
        return;
      }
      setUser(user);

      const { data: licenseData } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);

      setLicenses(licenseData || []);
      setLoading(false);
    };

    getData();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/portal/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const handleActivate = async () => {
    if (!requestKey.trim()) {
      alert('Please paste the request key from the desktop app');
      return;
    }
    setActivating(true);

    const { error } = await supabase.from('licenses').insert({
      user_id: user.id,
      plan: user.user_metadata?.plan || 'starter',
      machine_id: requestKey.trim(),
    });

    if (error) {
      alert('Activation failed: ' + error.message);
    } else {
      alert('License activated successfully!');
      setRequestKey('');
      const { data: newLicenses } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);
      setLicenses(newLicenses || []);
    }
    setActivating(false);
  };

  const handleRevoke = async (licenseId: string) => {
    const { error } = await supabase
      .from('licenses')
      .update({ active: false })
      .eq('id', licenseId)
      .eq('user_id', user.id);

    if (error) {
      alert('Revocation failed');
    } else {
      setLicenses(licenses.filter(l => l.id !== licenseId));
    }
  };

  // Open Stripe Customer Portal for billing management & cancellation
  const handleManageBilling = async () => {
    setProcessing(true);

    const stripeCustomerId = user.user_metadata?.stripe_customer_id;

    if (!stripeCustomerId) {
      alert('No billing information found. Please contact support.');
      setProcessing(false);
      return;
    }

    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: stripeCustomerId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to open billing portal: ' + (data.error || 'Unknown error'));
      setProcessing(false);
    }
  };

  // Permanent account deletion via server-side API
  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: This will PERMANENTLY delete your account, all licenses, and data. This cannot be undone. Continue?')) {
      return;
    }

    setProcessing(true);

    const res = await fetch('/api/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    });

    const data = await res.json();

    if (data.success) {
      await supabase.auth.signOut();
      alert('Your account has been permanently deleted.');
      router.push('/');
    } else {
      alert('Account deletion failed: ' + (data.error || 'Unknown error'));
    }
    setProcessing(false);
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-3xl font-black text-teal-900">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const plan = user.user_metadata?.plan || 'Starter';
  const isLifetime = plan === 'Lifetime';
  const totalQuantity = parseInt(user.user_metadata?.quantity || '1', 10);
  const activeCount = licenses.length;

  return (
    <>
      <section className="py-20 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-4">
                Welcome back,
              </h1>
              <p className="text-3xl font-bold text-teal-800">{user.email}!</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/portal/login');
              }}
              className="bg-red-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-red-700 transition shadow-lg mt-6 md:mt-0"
            >
              Logout
            </button>
          </div>

          <p className="text-2xl text-gray-700 text-center mb-16 max-w-4xl mx-auto">
            Your CuraCore EMR license is active and ready to use.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Current Plan</h2>
              <p className="text-5xl font-black text-teal-700">{plan}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Status</h2>
              <p className="text-4xl font-black text-green-600">Active</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Billing</h2>
              <p className="text-3xl font-black text-teal-700">
                {isLifetime ? 'One-time' : 'Monthly'}
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Active Licenses</h2>
              <p className="text-5xl font-black text-teal-700">
                {activeCount} / {totalQuantity}
              </p>
            </div>
          </div>

          {/* Activate New Computer */}
          <div className="bg-white rounded-3xl shadow-xl p-12 mb-20 border border-teal-100">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-10 text-center">
              Activate New Computer
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Paste request key from desktop app"
                value={requestKey}
                onChange={(e) => setRequestKey(e.target.value)}
                className="flex-1 w-full px-8 py-6 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
              />
              <button
                onClick={handleActivate}
                disabled={activating}
                className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-xl text-2xl font-bold hover:bg-yellow-300 disabled:opacity-60 transition shadow-lg"
              >
                {activating ? 'Activating...' : 'Activate'}
              </button>
            </div>
          </div>

          {/* Activated Computers Table */}
          <div className="bg-white rounded-3xl shadow-xl p-12 mb-20 border border-teal-100">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-10 text-center">
              Activated Computers
            </h2>
            {licenses.length === 0 ? (
              <p className="text-center text-gray-500 text-xl py-12">
                No computers activated yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-4 border-teal-300">
                    <tr>
                      <th className="py-6 text-teal-900 font-black text-xl">Machine ID</th>
                      <th className="py-6 text-teal-900 font-black text-xl">Activated On</th>
                      <th className="py-6 text-teal-900 font-black text-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                        <td className="py-6 font-medium text-gray-800">{license.machine_id}</td>
                        <td className="py-6 text-gray-700">
                          {new Date(license.activated_at).toLocaleDateString()}
                        </td>
                        <td className="py-6">
                          <button
                            onClick={() => handleRevoke(license.id)}
                            className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition shadow"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-teal-100">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-12 text-center">
              Account Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {!isLifetime && (
                <button
                  onClick={handleManageBilling}
                  disabled={processing}
                  className="bg-orange-600 text-white py-8 rounded-2xl text-2xl font-bold hover:bg-orange-700 disabled:opacity-60 transition shadow-xl"
                >
                  {processing ? 'Opening Portal...' : 'Manage Billing & Cancel Plan'}
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white py-8 rounded-2xl text-2xl font-bold hover:bg-red-700 transition shadow-xl"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-xl p-12 mt-20 border border-teal-100">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-12 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a
                href="https://your-desktop-app-download-link.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-teal-800 text-white py-6 rounded-xl text-xl font-bold hover:bg-teal-700 text-center block transition shadow-lg"
              >
                Download Desktop App
              </a>
              <a
                href="/buy"
                className="bg-yellow-400 text-teal-900 py-6 rounded-xl text-xl font-bold hover:bg-yellow-300 text-center block transition shadow-lg"
              >
                Upgrade Plan
              </a>
              <a
                href="https://billing.stripe.com/p/login/test_..."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white py-6 rounded-xl text-xl font-bold hover:bg-gray-600 text-center block transition shadow-lg"
              >
                View Invoices
              </a>
              <a
                href="/support"
                className="bg-teal-600 text-white py-6 rounded-xl text-xl font-bold hover:bg-teal-500 text-center block transition shadow-lg"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-3xl p-12 max-w-lg w-full">
            <h3 className="text-4xl font-black text-red-600 mb-8 text-center">
              Permanently Delete Account?
            </h3>
            <p className="text-xl text-gray-700 mb-10 text-center leading-relaxed">
              This action is <strong>irreversible</strong>. All your licenses, data, and account will be permanently deleted.
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleDeleteAccount}
                disabled={processing}
                className="bg-red-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-red-700 disabled:opacity-60 transition"
              >
                {processing ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}