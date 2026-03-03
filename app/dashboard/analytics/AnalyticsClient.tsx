'use client';

import { useEffect, useState } from 'react';
import {
  Line,
  Bar
} from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

type StatPoint = { label: string; value: number };
type MrrArr = { mrr: number; arr: number };
type ChurnPoint = { date: string; activated: number; revoked: number };
type DailyMachinesPoint = { date: string; value: number };

export default function AnalyticsClient() {
  const [subGrowth, setSubGrowth] = useState<StatPoint[]>([]);
  const [licenseUsage, setLicenseUsage] = useState<StatPoint[]>([]);
  const [machineHeat, setMachineHeat] = useState<StatPoint[]>([]);
  const [mrrArr, setMrrArr] = useState<MrrArr | null>(null);
  const [churn, setChurn] = useState<ChurnPoint[]>([]);
  const [dailyMachines, setDailyMachines] = useState<DailyMachinesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        subRes,
        licRes,
        machRes,
        mrrArrRes,
        churnRes,
        dailyMachinesRes,
      ] = await Promise.all([
        fetch('/api/analytics/subscriptions-growth'),
        fetch('/api/analytics/license-usage'),
        fetch('/api/analytics/machine-heatmap'),
        fetch('/api/analytics/mrr-arr'),
        fetch('/api/analytics/license-churn'),
        fetch('/api/analytics/daily-active-machines'),
      ]);

      if (
        !subRes.ok ||
        !licRes.ok ||
        !machRes.ok ||
        !mrrArrRes.ok ||
        !churnRes.ok ||
        !dailyMachinesRes.ok
      ) {
        setError('Failed to load analytics.');
        return;
      }

      setSubGrowth(await subRes.json());
      setLicenseUsage(await licRes.json());
      setMachineHeat(await machRes.json());
      setMrrArr(await mrrArrRes.json());
      setChurn(await churnRes.json());
      setDailyMachines(await dailyMachinesRes.json());
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-900 mb-6">Analytics</h1>
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-900 mb-6">Analytics</h1>
        <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>
      </div>
    );
  }

  const subGrowthData = {
    labels: subGrowth.map((p) => p.label),
    datasets: [
      {
        label: 'Subscriptions',
        data: subGrowth.map((p) => p.value),
        borderColor: 'rgba(13,148,136,1)',
        backgroundColor: 'rgba(13,148,136,0.2)',
      },
    ],
  };

  const licenseUsageData = {
    labels: licenseUsage.map((p) => p.label),
    datasets: [
      {
        label: 'Count',
        data: licenseUsage.map((p) => p.value),
        backgroundColor: ['#0f766e', '#22c55e', '#ef4444'],
      },
    ],
  };

  const dailyMachinesData = {
    labels: dailyMachines.map((p) => p.date),
    datasets: [
      {
        label: 'Daily active machines',
        data: dailyMachines.map((p) => p.value),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-teal-900 mb-2">Analytics</h1>
      <p className="text-gray-600 mb-4">
        High‑level overview of your product performance.
      </p>

      {/* MRR / ARR */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue (MRR / ARR)</h2>
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">MRR</div>
            <div className="text-3xl font-bold text-teal-800">
              {mrrArr ? `$${mrrArr.mrr.toLocaleString()}` : '—'}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">ARR</div>
            <div className="text-3xl font-bold text-teal-800">
              {mrrArr ? `$${mrrArr.arr.toLocaleString()}` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription growth (Chart.js Line) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Subscriptions growth</h2>
        <Line data={subGrowthData} />
      </section>

      {/* License usage (Chart.js Bar) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">License usage</h2>
        <Bar data={licenseUsageData} />
      </section>

      {/* Daily active machines (Chart.js Line) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Daily active machines</h2>
        <Line data={dailyMachinesData} />
      </section>

      {/* License churn (Recharts AreaChart) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">License churn</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <AreaChart data={churn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ReTooltip />
              <Area
                type="monotone"
                dataKey="activated"
                stackId="1"
                stroke="#22c55e"
                fill="#bbf7d0"
                name="Activated"
              />
              <Area
                type="monotone"
                dataKey="revoked"
                stackId="1"
                stroke="#ef4444"
                fill="#fecaca"
                name="Revoked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Machine activation heatmap (simple blocks, still useful) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Machine activations (recent)
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {machineHeat.map((p) => (
            <div key={p.label} className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-md"
                style={{
                  backgroundColor:
                    p.value === 0
                      ? '#e5e7eb'
                      : `rgba(13, 148, 136, ${Math.min(1, p.value / 10)})`,
                }}
              />
              <span className="text-[10px] text-gray-500 mt-1">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
