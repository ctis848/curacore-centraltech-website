'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';

// Register Chart.js components (only once)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

interface DashboardClientProps {
  user: any; // Replace 'any' with proper User type from Supabase if available
  role: string;
}

export default function DashboardClient({ user, role }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Optional: double-check auth on client side (server already protected)
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/dashboard/overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result || result.error) {
          throw new Error(result?.error || 'No dashboard data returned');
        }

        setData(result);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  const {
    latest_sub,
    total_subs,
    active_machines,
    machines,
    last_activation,
    recent_activity,
    sub_growth,
  } = data;

  // Subscription Growth - Line Chart
  const subGrowthData = {
    labels: sub_growth?.map((g: any) => g.month) || [],
    datasets: [
      {
        label: 'Subscriptions',
        data: sub_growth?.map((g: any) => g.count) || [],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Machine Usage - Bar Chart
  const machineUsageData = {
    labels: machines?.map((m: any) => m.device_name || 'Unknown') || [],
    datasets: [
      {
        label: 'Usage (%)',
        data: machines?.map((m: any) => m.usage_percent || 0) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10 lg:space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-teal-900">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-gray-600 mt-2">
            Role: <span className="font-medium capitalize">{role || 'User'}</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-teal-100 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Total Subscriptions</p>
          <p className="text-3xl md:text-4xl font-bold text-teal-700">
            {total_subs ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-teal-100 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Active Machines</p>
          <p className="text-3xl md:text-4xl font-bold text-teal-700">
            {active_machines ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-teal-100 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Last Activation</p>
          <p className="text-xl md:text-2xl font-semibold text-teal-700">
            {last_activation
              ? new Date(last_activation).toLocaleDateString()
              : 'No activations yet'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Growth */}
        <section className="bg-white shadow-md rounded-xl p-6 border border-teal-100">
          <h2 className="text-xl md:text-2xl font-bold text-teal-900 mb-6">
            Subscription Growth
          </h2>
          <div className="h-72 md:h-80">
            <Line
              data={subGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </section>

        {/* Machine Usage */}
        <section className="bg-white shadow-md rounded-xl p-6 border border-teal-100">
          <h2 className="text-xl md:text-2xl font-bold text-teal-900 mb-6">
            Machine Usage
          </h2>
          <div className="h-72 md:h-80">
            <Bar
              data={machineUsageData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Usage (%)' },
                  },
                },
              }}
            />
          </div>
        </section>
      </div>

      {/* Recent License Activity */}
      <section className="bg-white shadow-md rounded-xl p-6 border border-teal-100">
        <h2 className="text-xl md:text-2xl font-bold text-teal-900 mb-6">
          Recent License Activity
        </h2>
        <div className="h-72 md:h-80">
          <ResponsiveContainer>
            <AreaChart data={recent_activity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activated_at" />
              <YAxis />
              <ReTooltip />
              <Area
                type="monotone"
                dataKey="id"
                stroke="#0d9488"
                fill="#99f6e4"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Role-based content (example) */}
      {role === 'admin' && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-800 mb-4">
            Admin Controls
          </h2>
          <p className="text-amber-700">
            Admin-only features (manage users, revoke licenses, view logs, etc.) go here.
          </p>
        </section>
      )}
    </div>
  );
}