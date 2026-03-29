import { supabaseServer } from "@/lib/supabase/server";
import EditAdminUserForm from "./EditAdminUserForm";

export const dynamic = "force-dynamic";

export default async function EditAdminUserPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("id, email, name, role, active")
    .eq("id", params.id)
    .single();

  if (error || !user) {
    return <p className="text-sm text-red-600">Admin user not found.</p>;
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Edit Admin User</h2>
      <EditAdminUserForm user={user} />
    </div>
  );
}
