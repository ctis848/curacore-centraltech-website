// FILE: app/api/admin/role-assign/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { admin_id, role_id } = await req.json();
  const supabase = supabaseServer();

  const { error } = await supabase.from("admin_role_map").insert({
    admin_id,
    role_id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
