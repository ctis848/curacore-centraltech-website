export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error loading profile:", profileError.message);
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow rounded-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <p>
        <span className="font-semibold">Email:</span> {user.email}
      </p>

      <p>
        <span className="font-semibold">Name:</span> {profile?.name ?? "—"}
      </p>

      <p>
        <span className="font-semibold">Role:</span> {profile?.role ?? "User"}
      </p>
    </div>
  );
}
