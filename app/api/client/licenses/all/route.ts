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

    const clientId = client.id;

    // Auto-expire licenses
    await supabaseAdmin
      .from("licenses")
      .update({ status: "EXPIRED" })
      .lte("expires_at", new Date().toISOString())
      .eq("status", "ACTIVE")
      .eq("client_id", clientId);

    // Fetch all licenses
    const { data, error } = await supabaseAdmin
      .from("client_licenses")
      .select(`
        id,
        product_name,
        status,
        expires_at,
        created_at,
        licenses (
          license_key,
          activation_count,
          max_activations
        )
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to load licenses" }, { status: 500 });
    }

    const licenses = data?.map((row: any) => ({
      id: row.id,
      productName: row.product_name,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      licenseKey: row.licenses?.license_key ?? "",
      activationCount: row.licenses?.activation_count ?? 0,
      maxActivations: row.licenses?.max_activations ?? null,
    })) ?? [];

    return NextResponse.json({ licenses });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
