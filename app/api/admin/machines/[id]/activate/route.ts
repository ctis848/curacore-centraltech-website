import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: any) {
  try {
    const machineId = params.id;

    // 1️⃣ Load machine
    const { data: machine, error: machineErr } = await supabaseAdmin
      .from("machines")
      .select("id, company_id, active")
      .eq("id", machineId)
      .single();

    if (machineErr || !machine) {
      return NextResponse.json(
        { success: false, message: "Machine not found" },
        { status: 404 }
      );
    }

    if (machine.active) {
      return NextResponse.json(
        { success: false, message: "Machine is already active" },
        { status: 400 }
      );
    }

    // 2️⃣ Load company
    const { data: company, error: compErr } = await supabaseAdmin
      .from("companies")
      .select("license_count")
      .eq("id", machine.company_id)
      .single();

    if (compErr || !company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Count active machines
    const { data: activeMachines } = await supabaseAdmin
      .from("machines")
      .select("id")
      .eq("company_id", machine.company_id)
      .eq("active", true);

    const activeCount = activeMachines?.length || 0;

    if (activeCount >= company.license_count) {
      return NextResponse.json(
        {
          success: false,
          message: "License limit reached. Cannot activate more machines.",
        },
        { status: 400 }
      );
    }

    // 4️⃣ Activate machine
    const { error: updateErr } = await supabaseAdmin
      .from("machines")
      .update({ active: true })
      .eq("id", machineId);

    if (updateErr) {
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
