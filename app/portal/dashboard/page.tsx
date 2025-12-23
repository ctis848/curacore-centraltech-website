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
  const [invoices, setInvoices] = useState<any[]>([]); // Mock invoices
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

      // Mock invoices - in production, fetch from Stripe or your backend
      setInvoices([
        { id: 'inv_001', date: '2025-12-01', amount: '$15.00', status: 'Paid', pdf: '#' },
        { id: 'inv_002', date: '2025-11-01', amount: '$15.00', status: 'Paid', pdf: '#' },
        { id: 'inv_003', date: '2025-10-01', amount: '$15.00', status: 'Paid', pdf: '#' },
      ]);

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
    // ... (your existing code)
  };

  const handleRevoke = async (licenseId: string) => {
    // ... (your existing code)
  };

  const handleManageBilling = async () => {
    // ... (your existing Stripe portal code)
  };

  const handleDeleteAccount = async () => {
    // ... (your existing code)
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
          {/* Header & Existing Sections (Welcome, Stats, Activate, Licenses, etc.) */}
          {/* ... keep all your previous code up to Account Management ... */}

          {/* New: Billing & Invoices Section */}
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-teal-100 mt-20">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-12 text-center">
              Billing & Invoices
            </h2>

            {/* Billing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
              <div className="bg-teal-50 rounded-2xl p-8 text-center border border-teal-200">
                <h3 className="text-2xl font-bold text-teal-900 mb-4">Current Plan</h3>
                <p className="text-4xl font-black text-teal-800">{plan}</p>
              </div>
              <div className="bg-teal-50 rounded-2xl p-8 text-center border border-teal-200">
                <h3 className="text-2xl font-bold text-teal-900 mb-4">Next Billing</h3>
                <p className="text-3xl font-black text-teal-800">Jan 1, 2026</p>
              </div>
              <div className="bg-teal-50 rounded-2xl p-8 text-center border border-teal-200">
                <h3 className="text-2xl font-bold text-teal-900 mb-4">Payment Method</h3>
                <p className="text-2xl font-black text-teal-800">•••• 4242</p>
              </div>
            </div>

            {/* Invoices Table */}
            <h3 className="text-3xl font-black text-teal-900 mb-8 text-center">
              Invoice History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-4 border-teal-300">
                  <tr>
                    <th className="py-6 text-teal-900 font-black text-xl">Invoice ID</th>
                    <th className="py-6 text-teal-900 font-black text-xl">Date</th>
                    <th className="py-6 text-teal-900 font-black text-xl">Amount</th>
                    <th className="py-6 text-teal-900 font-black text-xl">Status</th>
                    <th className="py-6 text-teal-900 font-black text-xl">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-teal-100 hover:bg-teal-50 transition">
                      <td className="py-6 font-medium">{inv.id}</td>
                      <td className="py-6">{inv.date}</td>
                      <td className="py-6 font-bold text-teal-800">{inv.amount}</td>
                      <td className="py-6">
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-6">
                        <a
                          href={inv.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 font-bold hover:underline"
                        >
                          Download PDF →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={handleManageBilling}
                className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
              >
                Manage Billing in Stripe Portal
              </button>
            </div>
          </div>

          {/* Account Management & Quick Actions (keep existing) */}
          {/* ... your previous code ... */}

        </div>
      </section>

      {/* Delete Modal (keep existing) */}
      {/* ... */}
    </>
  );
}