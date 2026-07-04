"use client";

import { useEffect, useState } from "react";

export type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  created_at: string;
};

export default function AnalyticsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    const res = await fetch("/api/admin/payments");
    const json = await res.json();

    if (json.success) {
      setPayments(json.data as PaymentRow[]);
    }

    setLoading(false);
  }

  const total = payments.length;
  const success = payments.filter((p) => p.status === "success").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  const paystack = payments.filter((p) => p.gateway === "paystack").length;
  const flutterwave = payments.filter((p) => p.gateway === "flutterwave").length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payment Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Payments" value={total} />
        <StatCard title="Successful Payments" value={success} />
        <StatCard title="Failed Payments" value={failed} />
        <StatCard title="Paystack Payments" value={paystack} />
        <StatCard title="Flutterwave Payments" value={flutterwave} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow text-center">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
