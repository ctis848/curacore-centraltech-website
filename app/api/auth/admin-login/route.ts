// FILE: app/api/auth/admin-login/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!admin) {
    return NextResponse.json(
      { error: "Not authorized as admin" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
