import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // 1️⃣ Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ Load profile
    const { data: profile, error: profileError } = await supabase
      .from("Profile")
      .select("company_id")
      .eq("userid", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Load company billing info
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, annual_price, renewal_date")
      .eq("id", profile.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Load invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (invoiceError) {
      return NextResponse.json(
        { error: "Failed to load invoices" },
        { status: 500 }
      );
    }

    // 5️⃣ Build billing response
    return NextResponse.json({
      billing: {
        companyId: company.id,
        companyName: company.name,
        companyEmail: user.email,
        amountDue: company.annual_price,
        nextRenewalDate: company.renewal_date,
        planName: "CentralCore EMR Annual Subscription",
      },
      invoices: invoices || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
