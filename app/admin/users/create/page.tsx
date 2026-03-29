"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create admin user");
      return;
    }

    router.push("/admin/users");
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Create Admin User</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
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

        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1 bg-slate-900 text-white text-sm rounded disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
