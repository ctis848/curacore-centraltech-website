// PATH: app/api/client/payments/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // AUTH USER
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // CLIENT RECORD
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client record not found" },
        { status: 404 }
      );
    }

    // ⭐ FIXED: Correct table name → "payments"
    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    if (payErr) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch payments", error: payErr },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Unexpected server error", err },
      { status: 500 }
    );
  }
}
