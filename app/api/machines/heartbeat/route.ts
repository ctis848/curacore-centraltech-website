import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { machine_id } = await req.json();

  await supabase
    .from("machines")
    .update({ last_active: new Date() })
    .eq("device_id", machine_id);

  return NextResponse.json({ success: true });
}
