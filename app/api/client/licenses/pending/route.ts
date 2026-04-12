import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { supabase } from "@/lib/supabase/supabaseClient";

export async function GET(req: Request) {
  try {
    const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized", licenses: [] }, { status: 401 });
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session", licenses: [] }, { status: 401 });
    }

    // Resolve client
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!client) return NextResponse.json({ licenses: [] });

    // Fetch pending licenses
    const { data, error } = await supabaseAdmin
      .from("client_licenses")
      .select(`
        product_name,
        status,
        created_at,
        licenses ( license_key )
      `)
      .eq("client_id", client.id)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to load pending licenses" }, { status: 500 });
    }

    const licenses = data?.map((row: any) => ({
      licenseKey: row.licenses.license_key,
      productName: row.product_name,
      status: row.status,
      requestedAt: row.created_at,
    })) ?? [];

    return NextResponse.json({ licenses });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
