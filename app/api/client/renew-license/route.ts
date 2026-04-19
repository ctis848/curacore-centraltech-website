import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing license ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load license
    const { data: license, error: loadError } = await supabase
      .from("License")
      .select("*")
      .eq("id", id)
      .single();

    if (loadError || !license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    // Extend expiration by 1 year
    const now = new Date();
    const newExpiry = new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("License")
      .update({
        expiresAt: newExpiry,
        updatedAt: now.toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
