import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { requestKey } = await req.json();

    if (!requestKey) {
      return NextResponse.json(
        { success: false, error: "Missing requestKey" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: request, error } = await supabase
      .from("LicenseRequest")
      .select("*")
      .eq("requestKey", requestKey)
      .single();

    if (error || !request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
