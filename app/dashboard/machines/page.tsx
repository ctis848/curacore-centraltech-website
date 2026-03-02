'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function MachinesPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadMachines = async () => {
      setLoading(true);

      const { data } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      setMachines(data || []);
      setLoading(false);
    };

    loadMachines();
  }, [user, supabase]);

  const renameDevice = async (id: string) => {
    if (!newName.trim()) return alert('Device name cannot be empty');

    await supabase
      .from('machines')
      .update({ device_name: newName.trim() })
      .eq('id', id);

    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, device_name: newName.trim() } : m))
    );

    setEditingId(null);
    setNewName('');
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';

    await supabase
      .from('machines')
      .update({ status: newStatus })
      .eq('id', id);

    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  const assignToComputer = async (id: string) => {
    const deviceId = prompt('Enter Computer ID or Name:');
    if (!deviceId) return;

    await supabase
      .from('machines')
      .update({ assigned_to: deviceId })
      .eq('id', id);

    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, assigned_to: deviceId } : m))
    );
  };

  if (!user) return <p className="text-center mt-20">Loading...</p>;
  if (loading) return <p className="text-center mt-20">Loading machines...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-10">Manage Machines</h1>

      {machines.length === 0 && (
        <p className="text-gray-600">No machines or licenses created yet.</p>
      )}

      <div className="space-y-6">
        {machines.map((m) => (
          <div
            key={m.id}
            className="bg-white shadow-lg rounded-2xl p-6 border border-teal-100"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {editingId === m.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-64"
                />
              ) : (
                <h2 className="text-xl font-bold text-teal-900">
                  {m.device_name}
                </h2>
              )}

              <div className="flex gap-3">
                {editingId === m.id ? (
                  <button
                    onClick={() => renameDevice(m.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(m.id);
                      setNewName(m.device_name);
                    }}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                  >
                    Rename
                  </button>
                )}

                <button
                  onClick={() => toggleStatus(m.id, m.status)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    m.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {m.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => assignToComputer(m.id)}
                  className="bg-yellow-400 text-teal-900 px-4 py-2 rounded-lg hover:bg-yellow-300"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Status */}
            <p className="mb-2">
              <strong>Status:</strong>{' '}
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  m.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {m.status}
              </span>
            </p>

            {/* Assigned To */}
            <p className="mb-2">
              <strong>Assigned To:</strong>{' '}
              {m.assigned_to || 'Not assigned'}
            </p>

            {/* Usage Bar */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Usage</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full"
                  style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Last Activation */}
            <p className="text-sm text-gray-600 mt-3">
              <strong>Last Activation:</strong>{' '}
              {m.last_activation
                ? new Date(m.last_activation).toLocaleString()
                : 'Never activated'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
