import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  if (!q) return NextResponse.json({ results: [] });

  const [licenses, users, machines] = await Promise.all([
    supabase.from("licenses").select("*").ilike("id", `%${q}%`),
    supabase.from("profiles").select("*").ilike("email", `%${q}%`),
    supabase.from("machines").select("*").ilike("machine_id", `%${q}%`),
  ]);

  return NextResponse.json({
    results: {
      licenses: licenses.data ?? [],
      users: users.data ?? [],
      machines: machines.data ?? [],
    },
  });
}
