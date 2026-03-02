'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function SubscriptionsPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('paid_at', { ascending: false });

      if (!error) setSubs(data || []);
      setLoading(false);
    };

    load();
  }, [user, supabase]);

  if (!user) return <p className="p-10 text-center">Loading...</p>;
  if (loading) return <p className="p-10">Loading subscriptions...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-6">Subscription History</h1>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100">
        {subs.length === 0 && <p>No subscriptions found.</p>}

        {subs.map((s) => (
          <div key={s.id} className="border-b py-4">
            <p><strong>Plan:</strong> {s.plan}</p>
            <p><strong>Amount:</strong> ₦{s.amount.toLocaleString()}</p>
            <p><strong>Seats:</strong> {s.quantity}</p>
            <p><strong>Reference:</strong> {s.reference}</p>
            <p><strong>Paid At:</strong> {new Date(s.paid_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
