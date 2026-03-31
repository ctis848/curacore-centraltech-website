import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { clientEmail, licenseKey } = await req.json();

  if (!clientEmail || !licenseKey) {
    return NextResponse.json(
      { error: "Email and license key are required." },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  // 1. Find client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, email, name")
    .eq("email", clientEmail)
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: "Client not found." },
      { status: 404 }
    );
  }

  // 2. Save license
  const { error: licenseError } = await supabase
    .from("licenses")
    .insert({
      client_id: client.id,
      license_key: licenseKey,
      status: "active",
    });

  if (licenseError) {
    return NextResponse.json(
      { error: "Failed to save license." },
      { status: 500 }
    );
  }

  // 3. Send email
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-license-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: client.email,
      name: client.name,
      licenseKey,
    }),
  });

  return NextResponse.json({ success: true });
}
