import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { email, password } = await req.json();

  // 1. Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const user = data.user;

  // 2. Check if this user is a client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: "This login page is for Clients only." },
      { status: 403 }
    );
  }

  // 3. Create response
  const res = NextResponse.json({ success: true });

  // 4. Set cookies (role + session)
  res.cookies.set("role", "CLIENT", {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return res;
}
