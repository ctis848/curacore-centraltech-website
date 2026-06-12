import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { machine_id } = await req.json();

    if (!machine_id) {
      return NextResponse.json(
        { success: false, message: "Missing machine_id" },
        { status: 400 }
      );
    }

    // 1. Fetch machine
    const { data: machine, error: machineErr } = await supabaseAdmin
      .from("machines")
      .select("id, active")
      .eq("id", machine_id)
      .single();

    if (machineErr || !machine) {
      return NextResponse.json(
        { success: false, message: "Machine not found" },
        { status: 404 }
      );
    }

    // 2. If already inactive, return success
    if (!machine.active) {
      return NextResponse.json({
        success: true,
        message: "Machine already inactive",
      });
    }

    // 3. Deactivate machine
    const { error: updateErr } = await supabaseAdmin
      .from("machines")
      .update({ active: false })
      .eq("id", machine_id);

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: "Failed to deactivate machine" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Machine deactivated successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
