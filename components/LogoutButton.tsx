"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
