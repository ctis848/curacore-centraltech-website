// FILE: app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: any) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("admin_users")
    .update(body)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: any) {
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
