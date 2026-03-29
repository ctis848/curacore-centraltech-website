// FILE: app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = supabaseServer();

  const { email, name, role } = body;

  const { error } = await supabase.from("admin_users").insert({
    id: crypto.randomUUID(),
    email,
    name,
    role,
    active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
