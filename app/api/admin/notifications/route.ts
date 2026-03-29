import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  const { count } = await supabaseAdmin
    .from("license_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return NextResponse.json({ count });
}
