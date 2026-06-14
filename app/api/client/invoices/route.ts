import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ data: [] }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData?.user) {
      return NextResponse.json({ data: [] }, { status: 401 });
    }

    const user = userData.user;

    // ⭐ FIX — Match client by auth_user_id
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    // ⭐ Fetch invoices
    const { data: invoices } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ data: invoices });
  } catch (err) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
