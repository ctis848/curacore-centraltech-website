"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface RequireRoleProps {
  role: string;
  children: React.ReactNode;
}

export default function RequireRole({ role, children }: RequireRoleProps) {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== role) {
        router.push("/unauthorized");
      }
    }

    checkRole();
  }, [role]);

  return <>{children}</>;
}
