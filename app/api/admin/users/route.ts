import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await admin
    .from("User")
    .select("id, email, role, createdAt")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, role } = body as { id: string; role: "CLIENT" | "ADMIN" | "SUPERADMIN" };

  const { data, error } = await admin
    .from("User")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
