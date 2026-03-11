"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/client/login");
        return;
      }

      setChecking(false);
    }

    verify();
  }, []);

  if (checking) {
    return (
      <div className="p-10 text-center text-gray-600">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
