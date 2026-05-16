import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function LicenseHistoryPage({ params }: { params: { id: string } }) {
  const supabase = supabaseAdmin;

  const { data: licenses } = await supabase
    .from("License")
    .select("*")
    .eq("userId", params.id)
    .order("createdAt", { ascending: false });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">License History</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">License Key</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>

        <tbody>
          {licenses?.map((l) => (
            <tr key={l.id}>
              <td className="p-2 border">{l.productName}</td>
              <td className="p-2 border font-mono">{l.licenseKey}</td>
              <td className="p-2 border">{l.status}</td>
              <td className="p-2 border">
                {new Date(l.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
