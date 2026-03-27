import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Must await cookies() in Next.js 16+
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { user: null, error: "No Supabase session" },
        { status: 401 }
      );
    }

    // Pass token to Supabase
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      return NextResponse.json(
        { user: null, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    console.error("Supabase user error:", err);
    return NextResponse.json(
      { user: null, error: "Server error" },
      { status: 500 }
    );
  }
}
