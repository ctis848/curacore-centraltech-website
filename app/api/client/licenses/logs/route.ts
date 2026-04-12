import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(req: Request) {
  try {
    // Extract token from Authorization header
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate Supabase session
    const { data: session } = await supabaseAdmin.auth.getUser(token);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;

    // Fetch client record
    const { data: client, error: clientErr } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ success: true, logs: [] });
    }

    // Fetch license validation logs
    const { data: logs, error: logErr } = await supabaseAdmin
      .from("license_validation_logs")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    if (logErr) {
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
