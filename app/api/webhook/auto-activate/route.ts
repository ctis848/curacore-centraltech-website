import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestKey, machineId, licenseKey, secret } = body;

    if (secret !== process.env.WINDOWS_APP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: license } = await supabase
      .from("licenses")
      .select("*")
      .eq("request_key", requestKey)
      .eq("machine_id", machineId)
      .eq("status", "pending")
      .single();

    if (!license) {
      return NextResponse.json(
        { error: "Pending license not found" },
        { status: 404 }
      );
    }

    await supabase
      .from("licenses")
      .update({
        license_key: licenseKey,
        status: "active",
        activated_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
