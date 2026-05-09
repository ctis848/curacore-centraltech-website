import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1️⃣ Get user profile → company_id
    const { data: profile } = await supabase
      .from("Profile")
      .select("company_id")
      .eq("userid", userId)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json(
        { success: false, error: "Company not found for user" },
        { status: 404 }
      );
    }

    const companyId = profile.company_id;

    // 2️⃣ Get company details
    const { data: company } = await supabase
      .from("companies")
      .select("company_name, annual_fee, renewal_date, base_license_count, plan")
      .eq("id", companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
