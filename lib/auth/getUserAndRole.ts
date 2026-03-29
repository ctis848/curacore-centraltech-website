import { supabaseServer } from "../supabase/server";

export async function getUserAndRole() {
  const supabase = supabaseServer();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, role: null };
  }

  // Load role from your profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error loading user role:", profileError.message);
  }

  return {
    user,
    role: profile?.role ?? null,
  };
}
