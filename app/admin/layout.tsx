"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== "info@ctistech.com") {
        router.push("/dashboard");
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    check();
  }, []);

  if (loading) return <p className="p-6">Checking admin access...</p>;
  if (!allowed) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4 space-y-3">
        <a href="/admin">Admin Home</a>
        <a href="/admin/requests">Activation Requests</a>
        <a href="/admin/licenses">Create License</a>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
