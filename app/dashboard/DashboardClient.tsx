"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

import { Line, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardClient({ user }: { user: any }) {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const load = async () => {
      setLoading(true);

      const { data: result, error } = await supabase.rpc(
        "dashboard_overview",
        { uid: user.id }
      );

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    };

    load();
  }, [user, supabase, router]);

  if (loading || !data) {
    return <p className="text-center mt-20">Loading...</p>;
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

  const subGrowthData = {
    labels: sub_growth?.map((g: any) => g.month),
    datasets: [
      {
        label: "Subscriptions",
        data: sub_growth?.map((g: any) => g.count),
        borderColor: "rgba(13,148,136,1)",
        backgroundColor: "rgba(13,148,136,0.2)",
        tension: 0.4,
      },
    ],
  };

  const machineUsageData = {
    labels: machines?.map((m: any) => m.device_name),
    datasets: [
      {
        label: "Usage",
        data: machines?.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: "rgba(59,130,246,0.5)",
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 space-y-12">
      <Breadcrumbs />
      <h1 className="text-4xl font-bold text-teal-800 mb-6">
        Dashboard Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-xl">
          <p className="text-gray-500">Total Subscriptions</p>
          <p className="text-3xl font-bold">{total_subs}</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <p className="text-gray-500">Active Machines</p>
          <p className="text-3xl font-bold">{active_machines}</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <p className="text-gray-500">Last Activation</p>
          <p className="text-xl font-semibold">
            {last_activation || "No activations yet"}
          </p>
        </div>
      </div>

      {/* Subscription Growth Chart */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Growth</h2>
        <Line data={subGrowthData} />
      </section>

      {/* Machine Usage Chart */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Machine Usage</h2>
        <Bar data={machineUsageData} />
      </section>

      {/* License Activity (Recharts Area Chart) */}
      <section className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent License Activity</h2>
        <div className="w-full h-64">
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}