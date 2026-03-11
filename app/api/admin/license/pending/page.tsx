import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PendingLicensesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  // Simple admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData?.user?.id)
    .single();

  if (!userData?.user || profile?.role !== "admin") {
    redirect("/admin/login");
  }

  const { data: pending } = await supabase
    .from("licenses")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending License Activations</h1>

      {(!pending || pending.length === 0) && (
        <p className="text-gray-600">No pending activations.</p>
      )}

      <div className="space-y-6">
        {pending?.map((lic) => (
          <form
            key={lic.id}
            action="/api/admin/license/activate"
            method="POST"
            className="border rounded-xl p-5 bg-white shadow space-y-3"
          >
            <input type="hidden" name="license_id" value={lic.id} />

            <p><strong>User:</strong> {lic.user_id}</p>
            <p><strong>Machine ID:</strong> {lic.machine_id}</p>
            <p><strong>Machine Name:</strong> {lic.machine_name || "—"}</p>
            <p className="break-all">
              <strong>Request Key:</strong> {lic.request_key}
            </p>

            <div>
              <label className="block text-sm font-semibold mb-1">
                License Key (generated)
              </label>
              <input
                type="text"
                name="license_key"
                required
                className="w-full border px-3 py-2 rounded-lg"
                placeholder="Paste generated license key"
              />
            </div>

            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Activate License
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
