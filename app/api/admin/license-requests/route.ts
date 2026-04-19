import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await admin
    .from("LicenseRequest")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body as { id: string; status: string };

  const { data, error } = await admin
    .from("LicenseRequest")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
