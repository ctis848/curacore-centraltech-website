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

  // New states for cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  // Cancel Subscription (Monthly Plans Only)
  const handleCancelSubscription = async () => {
    if (user.user_metadata?.plan === 'Lifetime') {
      alert('Lifetime plans cannot be cancelled.');
      setShowCancelModal(false);
      return;
    }

    setProcessing(true);
    // In production: Call your backend or Stripe API to cancel subscription
    // Example: await fetch('/api/cancel-subscription', { method: 'POST' })

    // For now, we'll simulate by updating metadata
    const { error } = await supabase.auth.updateUser({
      data: { plan: 'cancelled', cancelled_at: new Date().toISOString() }
    });

    if (error) {
      alert('Cancellation failed: ' + error.message);
    } else {
      alert('Your subscription has been cancelled. Access continues until end of billing period.');
      setUser({ ...user, user_metadata: { ...user.user_metadata, plan: 'cancelled' } });
    }
    setProcessing(false);
    setShowCancelModal(false);
  };

  // Delete Account (Permanent)
  const handleDeleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all data. Are you absolutely sure?')) {
      return;
    }

    setProcessing(true);

    // In production: Use Supabase Admin API or backend to delete user
    // For demo: Just sign out
    await supabase.auth.signOut();
    alert('Your account has been scheduled for deletion. Goodbye!');
    router.push('/');
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
  const isCancelled = plan === 'cancelled';
  const totalQuantity = parseInt(user.user_metadata?.quantity || '1', 10);
  const activeCount = licenses.length;

  return (
    <>
      <section className="py-20 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
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

          {/* Plan Status Alert */}
          {isCancelled && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-6 mb-12 rounded-r-xl">
              <p className="text-xl font-bold text-orange-800">
                Your subscription is cancelled. Access continues until the end of your billing period.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Current Plan</h2>
              <p className="text-5xl font-black text-teal-700">{isCancelled ? 'Cancelled' : plan}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Status</h2>
              <p className="text-4xl font-black text-green-600">Active</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Billing</h2>
              <p className="text-3xl font-black text-teal-700">
                {isLifetime ? 'One-time' : isCancelled ? 'Ended' : 'Monthly'}
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Active Licenses</h2>
              <p className="text-5xl font-black text-teal-700">
                {activeCount} / {totalQuantity}
              </p>
            </div>
          </div>

          {/* Existing sections: Activate, Activated Computers, Quick Actions */}
          {/* ... (keep your existing code here - unchanged) ... */}

          {/* New: Account Management Section */}
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-teal-100 mt-20">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-12 text-center">
              Account Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {!isLifetime && !isCancelled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="bg-orange-600 text-white py-8 rounded-2xl text-2xl font-bold hover:bg-orange-700 transition shadow-xl"
                >
                  Cancel Subscription
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
        </div>
      </section>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl shadow-3xl p-12 max-w-lg w-full">
            <h3 className="text-4xl font-black text-teal-900 mb-8 text-center">
              Cancel Subscription?
            </h3>
            <p className="text-xl text-gray-700 mb-10 text-center">
              Your access will continue until the end of your current billing period.
              You can resubscribe anytime.
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="bg-orange-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-orange-700 disabled:opacity-60"
              >
                {processing ? 'Processing...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-gray-700"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl shadow-3xl p-12 max-w-lg w-full">
            <h3 className="text-4xl font-black text-red-600 mb-8 text-center">
              Delete Account?
            </h3>
            <p className="text-xl text-gray-700 mb-10 text-center">
              This action is <strong>permanent</strong>. All your data, licenses, and account will be deleted.
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleDeleteAccount}
                disabled={processing}
                className="bg-red-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-red-700 disabled:opacity-60"
              >
                {processing ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-gray-700"
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