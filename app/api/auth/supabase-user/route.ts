import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // Must await cookies() in Next.js 16+
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { user: null, error: "No Supabase session" },
        { status: 401 }
      );
    }

    // Supabase server client automatically reads cookies
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null, error: error?.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Supabase user error:", err);
    return NextResponse.json(
      { user: null, error: "Server error" },
      { status: 500 }
    );
  }
}
