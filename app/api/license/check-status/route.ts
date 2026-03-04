import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: licenses } = await supabase.from("licenses").select("*");

  const now = new Date();

  for (const lic of licenses || []) {
    if (lic.expires_at && new Date(lic.expires_at) < now && lic.is_active) {
      await supabase
        .from("licenses")
        .update({ is_active: false })
        .eq("id", lic.id);
    }
  }

  return NextResponse.json({ status: "checked" });
}
