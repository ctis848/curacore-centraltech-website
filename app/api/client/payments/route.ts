import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ⭐ FIX: cookies() must be awaited
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate user from token
    const { data: user, error: userErr } = await supabaseAdmin.auth.getUser(token);

    if (userErr || !user?.user) {
      return NextResponse.json(
        { success: false, message: "Invalid user" },
        { status: 401 }
      );
    }

    const userId = user.user.id;

    // Fetch payments for this user
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("userid", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Client payment fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
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
