import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = supabaseServer();

  const { data: roles } = await supabase
    .from("roles")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Roles & Permissions</h2>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {roles?.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.name}</td>
            </tr>
          ))}
          {!roles?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500">
                No roles defined.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Role assignment is handled on the Admin Users page.
      </p>
    </div>
  );
}
