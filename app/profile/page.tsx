import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow rounded-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <p><span className="font-semibold">Email:</span> {user.email}</p>
      <p><span className="font-semibold">Name:</span> {profile?.full_name ?? "—"}</p>
      <p><span className="font-semibold">Role:</span> {profile?.role ?? "user"}</p>
    </div>
  );
}
