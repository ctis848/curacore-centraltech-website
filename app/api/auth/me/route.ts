import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const accessToken = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("sb-access-token="))
    ?.split("=")[1];

  if (!accessToken) {
    return NextResponse.json({ user: null });
  }

  const { data } = await supabase.auth.getUser(accessToken);

  return NextResponse.json({ user: data.user });
}
