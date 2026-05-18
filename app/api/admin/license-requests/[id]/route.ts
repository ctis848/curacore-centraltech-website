import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { searchParams } = new URL(req.url);
  const requestKey = searchParams.get("key");

  const query = supabase
    .from("LicenseRequest")
    .select("*")
    .eq("id", params.id);

  if (requestKey) {
    query.eq("requestKey", requestKey);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
