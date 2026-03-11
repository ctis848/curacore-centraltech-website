import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ licenses: [] });
    }

    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ licenses: [], error: error.message });
    }

    return NextResponse.json({ licenses: licenses ?? [] });
  } catch (err) {
    return NextResponse.json({ licenses: [], error: "Server error" });
  }
}
