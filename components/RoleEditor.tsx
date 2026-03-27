"use client";

type RoleEditorProps = {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
  reload: () => void;
};

export default function RoleEditor({ user, reload }: RoleEditorProps) {
  async function updateRole(role: "superadmin" | "admin" | "staff" | "client") {
    await fetch("/api/admin/users/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: user.id,
        role,
      }),
    });

    reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => updateRole("superadmin")}
        className="px-3 py-1 bg-purple-600 text-white rounded"
      >
        Superadmin
      </button>

      <button
        onClick={() => updateRole("admin")}
        className="px-3 py-1 bg-teal-600 text-white rounded"
      >
        Admin
      </button>

      <button
        onClick={() => updateRole("staff")}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Staff
      </button>

      <button
        onClick={() => updateRole("client")}
        className="px-3 py-1 bg-gray-600 text-white rounded"
      >
        Client
      </button>
    </div>
  );
}
