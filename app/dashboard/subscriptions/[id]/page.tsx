'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useParams } from 'next/navigation';

export default function SubscriptionDetailPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { id } = useParams();

  const [subscription, setSubscription] = useState<any>(null);
  const [machines, setMachines] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !id) return;

    const load = async () => {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      setSubscription(sub);

      const { data: mach } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id);

      setMachines(mach || []);

      const { data: hist } = await supabase
        .from('license_history')
        .select('*')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false });

      setHistory(hist || []);
    };

    load();
  }, [user, id, supabase]);

  if (!subscription) {
    return <p className="text-center mt-20">Loading subscription...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-10">
        Subscription Details
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100 mb-10">
        <h2 className="text-2xl font-bold mb-4">Subscription Info</h2>
        <p><strong>Plan:</strong> {subscription.plan}</p>
        <p><strong>Expiry:</strong> {new Date(subscription.expiry).toLocaleDateString()}</p>
        <p><strong>Created:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100 mb-10">
        <h2 className="text-2xl font-bold mb-4">Machines</h2>
        {machines.length === 0 ? (
          <p>No machines registered.</p>
        ) : (
          machines.map((m) => (
            <div key={m.id} className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-4">
              <p><strong>Device Name:</strong> {m.device_name}</p>
              <p><strong>Device ID:</strong> {m.device_id}</p>
              <p><strong>Status:</strong> {m.status}</p>
              <p><strong>Last Active:</strong> {new Date(m.last_active).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100">
        <h2 className="text-2xl font-bold mb-4">License Activation History</h2>
        {history.length === 0 ? (
          <p>No license history found.</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4">
              <p><strong>License Key:</strong> {h.license_key}</p>
              <p><strong>Machine ID:</strong> {h.machine_id}</p>
              <p><strong>Activated At:</strong> {new Date(h.activated_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
