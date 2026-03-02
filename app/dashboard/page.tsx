'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardHome() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [totalSubs, setTotalSubs] = useState(0);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [activeMachines, setActiveMachines] = useState(0);
  const [lastActivation, setLastActivation] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [subGrowth, setSubGrowth] = useState<any[]>([]);
  const [machineUsage, setMachineUsage] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: latestSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('paid_at', { ascending: false })
        .limit(1)
        .single();

      setActivePlan(latestSub || null);

      const { count: subCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalSubs(subCount || 0);

      const { count: machineCount } = await supabase
        .from('machines')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setActiveMachines(machineCount || 0);

      const { data: allMachines } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id);

      setMachines(allMachines || []);

      const { data: history } = await supabase
        .from('license_history')
        .select('*')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })
        .limit(1);

      if (history?.length) {
        setLastActivation(new Date(history[0].activated_at).toLocaleString());
      }

      const { data: recent } = await supabase
        .from('license_history')
        .select('*')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })
        .limit(5);

      setActivity(recent || []);

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      const growth = subs?.reduce((acc: any, sub: any) => {
        const month = new Date(sub.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      setSubGrowth(
        Object.entries(growth || {}).map(([month, count]) => ({
          month,
          count
        }))
      );

      setMachineUsage(
        (allMachines || []).map((m) => ({
          name: m.device_name,
          usage: Math.floor(Math.random() * 100)
        }))
      );

      setNotifications([
        { id: 1, text: 'Your subscription is active.' },
        { id: 2, text: 'A new machine was registered.' },
        { id: 3, text: 'License activation completed successfully.' }
      ]);
    };

    load();
  }, [user, supabase]);

  if (!user) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 space-y-12">

      <Breadcrumbs />

      <h1 className="text-4xl font-bold text-teal-800 mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-lg font-semibold text-teal-700">Active Plan</h2>
          <p className="text-xl mt-3">{activePlan ? activePlan.plan : 'No active subscription'}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-lg font-semibold text-teal-700">Total Subscriptions</h2>
          <p className="text-4xl font-bold mt-3">{totalSubs}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-lg font-semibold text-teal-700">Active Machines</h2>
          <p className="text-4xl font-bold mt-3">{activeMachines}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-lg font-semibold text-teal-700">Last Activation</h2>
          <p className="text-lg mt-3">{lastActivation || 'No activations yet'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Subscription Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={subGrowth}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#0d9488' }} />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Machine Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={machineUsage}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#0d9488' }} />
              <Bar dataKey="usage" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-gray-600">No recent activity.</p>
          ) : (
            activity.map((a) => (
              <div key={a.id} className="p-4 bg-gray-100 border border-gray-300 rounded-xl mb-3">
                <p><strong>License:</strong> {a.license_key}</p>
                <p><strong>Machine:</strong> {a.machine_id}</p>
                <p><strong>At:</strong> {new Date(a.activated_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Notifications</h2>
          {notifications.map((n) => (
            <div key={n.id} className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-3">
              {n.text}
            </div>
          ))}
        </div>
      </div>

      {/* Licenses */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-teal-200">
        <h2 className="text-2xl font-bold text-teal-800 mb-4">Your Licenses</h2>
        {machines.length === 0 ? (
          <p className="text-gray-600">No licenses assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {machines.map((m) => (
              <li key={m.id} className="p-4 bg-gray-100 border border-gray-300 rounded-xl flex justify-between">
                <span>{m.device_name}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  m.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-8 border border-teal-200">
        <h2 className="text-2xl font-bold text-teal-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/subscriptions" className="bg-teal-700 text-white text-center py-3 rounded-xl hover:bg-teal-800 transition">
            View Subscriptions
          </Link>
          <Link href="/dashboard/machines" className="bg-teal-700 text-white text-center py-3 rounded-xl hover:bg-teal-800 transition">
            Manage Machines
          </Link>
          <Link href="/dashboard/history" className="bg-teal-700 text-white text-center py-3 rounded-xl hover:bg-teal-800 transition">
            License History
          </Link>
          <Link href="/dashboard/settings" className="bg-teal-700 text-white text-center py-3 rounded-xl hover:bg-teal-800 transition">
            Settings
          </Link>
        </div>
      </div>

    </div>
  );
}
