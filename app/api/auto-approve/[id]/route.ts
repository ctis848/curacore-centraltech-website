import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request, { params }: any) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const requestId = params.id;

  const { data: reqData } = await supabase
    .from("license_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  const licenseKey = crypto.randomUUID().toUpperCase();

  await supabase.from("licenses").insert({
    client_id: reqData.client_id,
    product_name: "CTIS Product",
    license_key: licenseKey,
    max_machines: 200,
    machines_used: 0,
    status: "active",
    start_date: new Date().toISOString(),
  });

  await supabase
    .from("license_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  return NextResponse.json({ ok: true });
}
