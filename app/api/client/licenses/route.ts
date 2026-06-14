// FILE: app/api/client/licenses/route.ts

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

  // Get logged‑in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ⭐ FIX — Find client by auth_user_id
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (clientErr || !client) {
    return NextResponse.json(
      { error: "Client record not found" },
      { status: 404 }
    );
  }

  // ⭐ FIX — Read licenses for this client
  const { data: licenses, error: licErr } = await supabase
    .from("licenses")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (licErr) {
    console.error(licErr);
    return NextResponse.json(
      { error: "Failed to load licenses" },
      { status: 500 }
    );
  }

  return NextResponse.json(licenses || []);
}
