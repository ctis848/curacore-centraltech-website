"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

export default function SuperAdminCenter() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.user_metadata.role !== "superadmin") {
        router.push("/unauthorized");
        return;
      }

      setUser(user);
    }

    load();
  }, [router, supabase]);

  if (!user) return <p className="p-10">Loading…</p>;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-6">Superadmin Control Center</h1>
      {/* content as before */}
    </div>
  );
}
