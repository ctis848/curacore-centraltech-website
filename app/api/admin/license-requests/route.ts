import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING | APPROVED | REJECTED | ALL

    let query = supabaseAdmin
      .from("LicenseRequest")
      .select(`
        id,
        userId,
        productName,
        requestKey,
        status,
        requestedAt,
        userEmail,
        companyName
      `)
      .order("requestedAt", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("License request list error:", err);
    return NextResponse.json(
      { success: false, message: "Server error loading license requests" },
      { status: 500 }
    );
  }
}
