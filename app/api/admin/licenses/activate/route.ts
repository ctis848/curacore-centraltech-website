import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { company_id, device_id } = await req.json();

    if (!company_id || !device_id) {
      return NextResponse.json(
        { success: false, message: "Missing company_id or device_id" },
        { status: 400 }
      );
    }

    // 1. Fetch company
    const { data: company, error: companyErr } = await supabaseAdmin
      .from("companies")
      .select("id, license_count")
      .eq("id", company_id)
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    // 2. Count active machines
    const { data: activeMachines, error: activeErr } = await supabaseAdmin
      .from("machines")
      .select("id")
      .eq("company_id", company_id)
      .eq("active", true);

    if (activeErr) {
      return NextResponse.json(
        { success: false, message: "Failed to check active machines" },
        { status: 500 }
      );
    }

    const activeCount = activeMachines.length;

    // 3. Check license availability
    if (activeCount >= company.license_count) {
      return NextResponse.json({
        success: false,
        message: "No available licenses. Please deactivate an old machine.",
      });
    }

    // 4. Insert new machine record
    const { error: insertErr } = await supabaseAdmin
      .from("machines")
      .insert({
        company_id,
        device_id,
        active: true,
      });

    if (insertErr) {
      return NextResponse.json(
        { success: false, message: "Failed to activate machine" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Machine activated successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
