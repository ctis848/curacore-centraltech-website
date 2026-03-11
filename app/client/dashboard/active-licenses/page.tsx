import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DataTable from "@/components/dashboard/DataTable";

interface ActivationRow {
  id: string;
  license_key: string;
  machine_id: string;
  activated_at: string | null;
  expires_at: string | null;
}

export default async function ActivateLicensePage() {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/client/login");
  }

  // Fetch licenses for this user
  const { data: licenses, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("user_id", user.id)
    .order("activated_at", { ascending: false });

  if (error) {
    console.error("Error loading licenses:", error);
  }

  // Table column definitions
  const columns = [
    { label: "License Key", key: "license_key" },
    { label: "Machine ID", key: "machine_id" },
    {
      label: "Activated",
      key: "activated_at",
      render: (row: ActivationRow) =>
        row.activated_at
          ? new Date(row.activated_at).toLocaleString()
          : "—",
    },
    {
      label: "Expires",
      key: "expires_at",
      render: (row: ActivationRow) =>
        row.expires_at
          ? new Date(row.expires_at).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Activate License</h1>

      <DataTable<ActivationRow>
        columns={columns}
        data={licenses || []}
        searchable
        sortable
        paginated
        exportable
      />
    </div>
  );
}
