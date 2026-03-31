// FILE: app/api/admin/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return NextResponse.json({ count: count ?? 0 });
}
