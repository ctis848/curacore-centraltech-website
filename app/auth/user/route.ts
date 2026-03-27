import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { user: null, authenticated: false },
      { status: 200 }
    );
  }

  return NextResponse.json({
    user,
    authenticated: true,
  });
}
