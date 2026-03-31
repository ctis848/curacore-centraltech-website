import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { licenseKey, clientEmail } = await req.json();

  const supabase = supabaseServer();

  // 1. Find client by email
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", clientEmail)
    .single();

  if (!client) {
    return NextResponse.json(
      { error: "Client not found" },
      { status: 404 }
    );
  }

  // 2. Save license
  await supabase.from("licenses").insert({
    client_id: client.id,
    license_key: licenseKey,
    status: "active",
  });

  // 3. Send email (optional)
  // await sendLicenseEmail(clientEmail, licenseKey);

  return NextResponse.json({ success: true });
}
