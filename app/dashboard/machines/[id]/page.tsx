'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useParams } from 'next/navigation';

export default function MachineDetailPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { id } = useParams();

  const [machine, setMachine] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    const load = async () => {
      const { data: m } = await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .single();

      setMachine(m);

      const { data: h } = await supabase
        .from('license_history')
        .select('*')
        .eq('machine_id', m.device_id)
        .order('activated_at', { ascending: false });

      setHistory(h || []);
    };

    load();
  }, [user, id, supabase]);

  const copyKey = () => {
    navigator.clipboard.writeText(machine.device_id);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 1500);
  };

  if (!machine) return <p className="mt-20 text-center">Loading machine...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-10">Machine Details</h1>

      {/* Machine Info */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100 space-y-4 mb-10">
        <p><strong>Device Name:</strong> {machine.device_name}</p>
        <p><strong>Device ID:</strong> {machine.device_id}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            machine.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {machine.status}
          </span>
        </p>
        <p><strong>Last Active:</strong> {new Date(machine.last_active).toLocaleString()}</p>
      </div>

      {/* Request Key Copy */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100 mb-10">
        <h2 className="text-2xl font-bold text-teal-900 mb-4">Request Key</h2>
        <p className="mb-3 text-gray-700">Copy this key into your license generator to activate the application.</p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={machine.device_id}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-gray-50"
          />
          <button
            onClick={copyKey}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Copy
          </button>
        </div>

        {copyMsg && <p className="text-green-600 mt-2">{copyMsg}</p>}
      </div>

      {/* Linked License Activations */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100">
        <h2 className="text-2xl font-bold text-teal-900 mb-4">License Activations</h2>

        {history.length === 0 ? (
          <p>No activations found for this machine.</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4">
              <p><strong>License Key:</strong> {h.license_key}</p>
              <p><strong>Activated At:</strong> {new Date(h.activated_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
