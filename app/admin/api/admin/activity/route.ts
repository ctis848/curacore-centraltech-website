// FILE: app/api/admin/activity/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { admin_id, action, details } = await req.json();
  const supabase = supabaseServer();

  const { error } = await supabase.from("activity_logs").insert({
    admin_id,
    action,
    details,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
