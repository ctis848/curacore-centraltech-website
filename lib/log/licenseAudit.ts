import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function auditLicenseChange(licenseId: string, oldData: any, newData: any) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("license_audit").insert({
    license_id: licenseId,
    admin_id: user.id,
    old_data: oldData,
    new_data: newData,
  });
}
