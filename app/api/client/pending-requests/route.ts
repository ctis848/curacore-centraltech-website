// FILE: app/api/client/pending-requests/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("LicenseRequest")
    .select("*")
    .eq("userId", user.id)
    .eq("status", "PENDING")
    .order("requestedAt", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load pending requests" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
