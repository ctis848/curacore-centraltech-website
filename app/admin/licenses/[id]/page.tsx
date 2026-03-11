import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

async function getLicense(id: string) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: license } = await supabase
    .from("licenses")
    .select("*, machines(id, machine_id, created_at)")
    .eq("id", id)
    .single();

  return license;
}

export default async function LicenseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const license = await getLicense(params.id);

  if (!license) {
    return <div className="p-6">License not found.</div>;
  }

  async function resendLicense() {
    "use server";
    await fetch("/api/admin/licenses/resend", {
      method: "POST",
      body: JSON.stringify({ license_id: license.id }),
    });
  }

  async function deactivateMachines() {
    "use server";
    await fetch("/api/admin/licenses/deactivate-machines", {
      method: "POST",
      body: JSON.stringify({ license_id: license.id }),
    });
  }

  async function assignUser() {
    "use server";
    const email = prompt("Enter user email:");
    if (!email) return;

    await fetch("/api/admin/licenses/assign-user", {
      method: "POST",
      body: JSON.stringify({ license_id: license.id, email }),
    });
  }

  async function deleteLicense() {
    "use server";
    if (!confirm("Delete this license permanently?")) return;

    await fetch("/api/admin/licenses/delete", {
      method: "POST",
      body: JSON.stringify({ license_id: license.id }),
    });
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">License Details</h1>

      {/* LICENSE INFO */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <p><strong>License ID:</strong> {license.id}</p>
        <p><strong>Plan:</strong> {license.plan}</p>
        <p><strong>User:</strong> {license.user_id ?? "Unassigned"}</p>
        <p><strong>Machine Limit:</strong> {license.machine_limit}</p>
        <p><strong>Status:</strong> {license.is_active ? "Active" : "Inactive"}</p>
        <p>
          <strong>Renewal Due:</strong>{" "}
          {license.renewal_due_date
            ? new Date(license.renewal_due_date).toLocaleDateString()
            : "Not set"}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form action={resendLicense}>
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Resend License File
          </button>
        </form>

        <form action={deactivateMachines}>
          <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Deactivate All Machines
          </button>
        </form>

        <form action={assignUser}>
          <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Assign License to User
          </button>
        </form>

        <form action={deleteLicense}>
          <button className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-black">
            Delete License
          </button>
        </form>
      </div>

      {/* MACHINE BINDINGS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">Machine Bindings</h2>

        {license.machines?.length === 0 && (
          <p className="text-gray-600">No machines registered.</p>
        )}

        {license.machines?.map((m: any) => (
          <div key={m.id} className="border p-3 rounded bg-gray-50">
            <p><strong>Machine ID:</strong> {m.machine_id}</p>
            <p className="text-sm text-gray-500">
              Activated: {new Date(m.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
