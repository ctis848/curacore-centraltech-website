import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await supabaseAdmin
    .from("license_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  await supabaseAdmin.from("activity_logs").insert({
    action: "license_rejected",
    details: { request_id: id },
  });

  return NextResponse.json({ success: true });
}
