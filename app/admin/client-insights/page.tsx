import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClientInsightsPage() {
  const supabase = supabaseServer();

  const { data: insights } = await supabase
    .from("client_insights")
    .select(
      "id, client_id, total_licenses, total_payments, last_active, updated_at, clients(name, email)"
    )
    .order("updated_at", { ascending: false })
    .limit(100)
    .returns<any>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Client Insights</h2>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Client</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Total Licenses</th>
            <th className="p-2 text-left">Total Payments</th>
            <th className="p-2 text-left">Last Active</th>
            <th className="p-2 text-left">Updated</th>
          </tr>
        </thead>
        <tbody>
          {insights?.map((i: any) => (
            <tr key={i.id} className="border-t">
              <td className="p-2">{i.clients?.name || i.client_id}</td>
              <td className="p-2 text-xs">{i.clients?.email}</td>
              <td className="p-2">{i.total_licenses}</td>
              <td className="p-2">{i.total_payments}</td>
              <td className="p-2">
                {i.last_active && new Date(i.last_active).toLocaleString()}
              </td>
              <td className="p-2">
                {i.updated_at && new Date(i.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
          {!insights?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500" colSpan={6}>
                No client insights yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Insights are populated via backend jobs / APIs that aggregate usage,
        licenses, and payments.
      </p>
    </div>
  );
}
