import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { old_machine_id, new_device_id } = await req.json();

    if (!old_machine_id || !new_device_id) {
      return NextResponse.json(
        { success: false, message: "Missing old_machine_id or new_device_id" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1️⃣ Validate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2️⃣ Fetch the old machine
    const { data: oldMachine, error: oldErr } = await supabase
      .from("machines")
      .select("id, company_id, active")
      .eq("id", old_machine_id)
      .single();

    if (oldErr || !oldMachine) {
      return NextResponse.json(
        { success: false, message: "Old machine not found." },
        { status: 404 }
      );
    }

    // 3️⃣ Verify the user belongs to the same company
    const { data: companyUser, error: companyErr } = await supabase
      .from("CompanyUsers")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (companyErr || !companyUser) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to any company." },
        { status: 403 }
      );
    }

    if (companyUser.company_id !== oldMachine.company_id) {
      return NextResponse.json(
        { success: false, message: "This machine does not belong to your company." },
        { status: 403 }
      );
    }

    // 4️⃣ Deactivate old machine
    const { error: deactivateErr } = await supabase
      .from("machines")
      .update({ active: false })
      .eq("id", old_machine_id);

    if (deactivateErr) {
      return NextResponse.json(
        { success: false, message: "Failed to deactivate old machine." },
        { status: 500 }
      );
    }

    // 5️⃣ Activate new machine
    const { error: insertErr } = await supabase
      .from("machines")
      .insert({
        company_id: oldMachine.company_id,
        device_id: new_device_id,
        active: true,
      });

    if (insertErr) {
      return NextResponse.json(
        { success: false, message: "Failed to activate new machine." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "License transferred successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
