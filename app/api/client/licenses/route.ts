// FILE: app/api/client/licenses/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("client_id", user.id)
    .order("activated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load licenses" },
      { status: 500 }
    );
  }

  return NextResponse.json({ licenses: data });
}
