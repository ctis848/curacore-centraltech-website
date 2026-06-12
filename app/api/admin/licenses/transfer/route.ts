import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { old_machine_id, new_device_id } = await req.json();

    if (!old_machine_id || !new_device_id) {
      return NextResponse.json(
        { success: false, message: "Missing old_machine_id or new_device_id" },
        { status: 400 }
      );
    }

    // 1. Fetch old machine
    const { data: oldMachine, error: oldErr } = await supabaseAdmin
      .from("machines")
      .select("id, company_id, active")
      .eq("id", old_machine_id)
      .single();

    if (oldErr || !oldMachine) {
      return NextResponse.json(
        { success: false, message: "Old machine not found" },
        { status: 404 }
      );
    }

    if (!oldMachine.active) {
      return NextResponse.json(
        { success: false, message: "Old machine is already inactive" },
        { status: 400 }
      );
    }

    const company_id = oldMachine.company_id;

    // 2. Fetch company license_count
    const { data: company, error: companyErr } = await supabaseAdmin
      .from("companies")
      .select("license_count")
      .eq("id", company_id)
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    // 3. Count active machines
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

    // 4. Validate license availability
    if (activeCount > company.license_count) {
      return NextResponse.json(
        { success: false, message: "License count mismatch. Contact support." },
        { status: 500 }
      );
    }

    // Transfer is ALWAYS allowed because we deactivate one and activate one.

    // 5. Deactivate old machine
    const { error: deactivateErr } = await supabaseAdmin
      .from("machines")
      .update({ active: false })
      .eq("id", old_machine_id);

    if (deactivateErr) {
      return NextResponse.json(
        { success: false, message: "Failed to deactivate old machine" },
        { status: 500 }
      );
    }

    // 6. Insert new machine
    const { error: insertErr } = await supabaseAdmin
      .from("machines")
      .insert({
        company_id,
        device_id: new_device_id,
        active: true,
      });

    if (insertErr) {
      return NextResponse.json(
        { success: false, message: "Failed to activate new machine" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Machine transferred successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
