"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import RoleEditor from "@/components/RoleEditor";

export default function UserManagement() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);

  async function loadUsers() {
    const { data } = await supabase.auth.admin.listUsers();
    setUsers((data?.users as User[]) || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <table className="w-full border bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Role</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3 border">{u.email}</td>
              <td className="p-3 border">{u.user_metadata.role}</td>
              <td className="p-3 border">
                <RoleEditor user={u} reload={loadUsers} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
