import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export async function roleGuard(allowedRoles: string[]) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const role = user.user_metadata.role;

  if (!allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return user;
}
