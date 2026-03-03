import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const id = searchParams.get("id");

  if (!key && !id) {
    return NextResponse.json(
      { error: "Provide license key or id" },
      { status: 400 }
    );
  }

  let query = supabaseAdmin.from("licenses").select("*");

  if (key) {
    query = query.eq("key", key);
  } else {
    query = query.eq("id", id);
  }

  const { data: license, error } = await query.single();

  if (error || !license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: license.status,
    license,
  });
}
