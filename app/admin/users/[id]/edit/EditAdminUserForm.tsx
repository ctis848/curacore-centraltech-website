// FILE: app/admin/users/[id]/edit/EditAdminUserForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
};

export default function EditAdminUserForm({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: user.email || "",
    name: user.name || "",
    role: user.role || "admin",
    active: user.active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to update admin user");
      return;
    }

    router.push("/admin/users");
  };

  const onDelete = async () => {
    if (!confirm("Delete this admin user?")) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to delete admin user");
      return;
    }

    router.push("/admin/users");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border rounded px-2 py-1 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          className="w-full border rounded px-2 py-1 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
          <option value="finance">finance</option>
          <option value="support">support</option>
          <option value="viewer">viewer</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={form.active}
          onChange={onChange}
        />
        <label htmlFor="active" className="text-sm">
          Active
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1 bg-slate-900 text-white text-sm rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={loading}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
