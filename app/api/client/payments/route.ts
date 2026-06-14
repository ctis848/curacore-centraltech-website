import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Read auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate user from token
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { success: false, message: "Invalid user" },
        { status: 401 }
      );
    }

    const user = userData.user;

    // Find client record using email
    const { data: client, error: clientErr } = await supabaseAdmin
      .from("Clients")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (clientErr || !client) {
      return NextResponse.json(
        { success: false, message: "Client record not found" },
        { status: 404 }
      );
    }

    // Fetch ALL payments for this client
    const { data: payments, error: payErr } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("clientId", client.id)
      .order("created_at", { ascending: false });

    if (payErr) {
      console.error("Client payment fetch error:", payErr);
      return NextResponse.json(
        { success: false, message: payErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: payments });
  } catch (err: any) {
    console.error("Client Payments API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
