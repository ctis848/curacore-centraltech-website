import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export async function adminGuard() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect
  if (!user) {
    redirect("/auth/login");
  }

  // Not an admin → redirect
  if (user.user_metadata?.role !== "admin") {
    redirect("/unauthorized");
  }

  return user;
}
