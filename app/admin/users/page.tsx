import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = supabaseServer();

  const { data: users } = await supabase
    .from("admin_users")
    .select("id, email, name, role, active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Admin Users</h2>
        <Link
          href="/admin/users/create"
          className="px-3 py-1 text-sm bg-slate-900 text-white rounded"
        >
          + New Admin
        </Link>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Active</th>
            <th className="p-2 text-left">Created</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.active ? "Yes" : "No"}</td>
              <td className="p-2">
                {u.created_at && new Date(u.created_at).toLocaleString()}
              </td>
              <td className="p-2">
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {!users?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500" colSpan={6}>
                No admin users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
