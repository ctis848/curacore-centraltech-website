// FILE: app/api/admin/settings/update-name/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ name })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update name" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
