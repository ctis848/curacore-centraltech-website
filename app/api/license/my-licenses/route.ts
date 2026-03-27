import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load licenses" },
      { status: 500 }
    );
  }

  return NextResponse.json({ licenses: data });
}
