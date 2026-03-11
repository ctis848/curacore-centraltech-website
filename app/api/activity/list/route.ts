import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ logs: data });
}
