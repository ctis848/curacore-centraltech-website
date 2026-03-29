// FILE: app/admin/revenue/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";

type PaymentRow = {
  amount: number;
  currency: string;
  paid_at: string | null;
  clients: {
    name: string | null;
    email: string | null;
  }[] | null;
};

export default async function RevenuePage() {
  const supabase = supabaseServer();

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, currency, paid_at, clients(name, email)")
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Overview</h2>

      {/* TOTAL REVENUE CARD */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm text-slate-500">Total Revenue</p>
        <p className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
      </div>

      {/* PAYMENTS TABLE */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Payment Records</h3>

        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Client</th>
              <th className="p-2">Email</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Currency</th>
              <th className="p-2">Paid At</th>
            </tr>
          </thead>

          <tbody>
            {(payments as PaymentRow[])?.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{p.clients?.[0]?.name ?? "—"}</td>
                <td className="p-2">{p.clients?.[0]?.email ?? "—"}</td>
                <td className="p-2 font-bold">
                  ₦{Number(p.amount).toLocaleString()}
                </td>
                <td className="p-2">{p.currency}</td>
                <td className="p-2">
                  {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}

            {payments?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No payment records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
