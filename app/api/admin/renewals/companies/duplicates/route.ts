import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date");

    if (error) {
      console.error("Duplicate detection error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const map = new Map<
      string,
      { id: string; name: string; renewal_date: string | null }[]
    >();

    for (const c of data || []) {
      const key = c.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }

    const duplicates = Array.from(map.values()).filter((list) => list.length > 1);

    return NextResponse.json({
      success: true,
      duplicates,
      totalDuplicateGroups: duplicates.length,
    });
  } catch (err: any) {
    console.error("Duplicate detection API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
