import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: any) {
  try {
    const machineId = params.id;

    // 1️⃣ Load machine
    const { data: machine, error: machineErr } = await supabaseAdmin
      .from("machines")
      .select("id, active")
      .eq("id", machineId)
      .single();

    if (machineErr || !machine) {
      return NextResponse.json(
        { success: false, message: "Machine not found" },
        { status: 404 }
      );
    }

    if (!machine.active) {
      return NextResponse.json(
        { success: false, message: "Machine is already inactive" },
        { status: 400 }
      );
    }

    // 2️⃣ Deactivate machine
    const { error: updateErr } = await supabaseAdmin
      .from("machines")
      .update({ active: false })
      .eq("id", machineId);

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
