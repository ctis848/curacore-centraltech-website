import { NextResponse } from "next/server";
import crypto from "crypto";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { plan, machine_limit } = await req.json();

  const license_key = crypto.randomBytes(32).toString("hex");

  const { error } = await supabase.from("licenses").insert({
    plan,
    machine_limit,
    license_key,
    is_active: false,
    service_fee_paid: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, license_key });
}
