import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { license_id } = await req.json();

  await supabase.from("machines").delete().eq("license_id", license_id);

  return NextResponse.json({ success: true });
}
