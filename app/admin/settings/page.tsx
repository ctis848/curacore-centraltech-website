// FILE: app/admin/settings/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import UpdateNameForm from "./UpdateNameForm";
import UpdatePasswordForm from "./UpdatePasswordForm";

export default async function AdminSettingsPage() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-red-600">Unauthorized</div>;
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {/* PROFILE INFO */}
      <div className="bg-white p-6 rounded-lg shadow space-y-2">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {admin?.name ?? "Not set"}</p>
        <p><strong>Role:</strong> {admin?.role}</p>
      </div>

      {/* UPDATE NAME */}
      <UpdateNameForm currentName={admin?.name ?? ""} />

      {/* UPDATE PASSWORD */}
      <UpdatePasswordForm />
    </div>
  );
}
