// FILE: app/api/admin/audit/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { admin_id, entity, entity_id, action } = await req.json();
  const supabase = supabaseServer();

  const { error } = await supabase.from("audit_trails").insert({
    admin_id,
    entity,
    entity_id,
    action,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
