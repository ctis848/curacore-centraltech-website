import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = await req.json();
  const extraLicenses = Number(body.extraLicenses || 0);

  if (extraLicenses <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid license count" },
      { status: 400 }
    );
  }

  const { data: client, error } = await supabase
    .from("Clients")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (error || !client) {
    return NextResponse.json(
      { success: false, error: "Client not found" },
      { status: 404 }
    );
  }

  const newTotal = (client.totalLicenses || 0) + extraLicenses;

  await supabase
    .from("Clients")
    .update({ totalLicenses: newTotal })
    .eq("id", client.id);

  return NextResponse.json({ success: true, totalLicenses: newTotal });
}
