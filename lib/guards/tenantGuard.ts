import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export async function tenantAdminGuard() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const role = user.user_metadata.role;
  const tenantId = user.user_metadata.tenant_id;

  if (!tenantId) redirect("/unauthorized");

  if (!["admin", "tenant_admin"].includes(role)) {
    redirect("/unauthorized");
  }

  return { user, tenantId };
}
