"use client";

import { createSupabaseClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const supabase = createSupabaseClient();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <button onClick={logout} className="text-red-600 font-semibold">
      Logout
    </button>
  );
}
