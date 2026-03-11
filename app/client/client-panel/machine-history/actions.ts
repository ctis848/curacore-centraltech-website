"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function unbindMachine(machineId: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("machines")
    .update({ status: "unbound" })
    .eq("id", machineId);
}

export async function bindMachine(machineId: string, licenseKey: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("machines")
    .update({ status: "bound", license_key: licenseKey })
    .eq("id", machineId);
}
