// FILE: app/api/admin/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact" })
    .eq("read", false);

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: data?.length || 0 });
}
