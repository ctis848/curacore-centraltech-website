import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("reminder_logs")
      .select("company_id, reminder_key, reminder_date, sent_at, companies(name)")
      .order("sent_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const logs = data.map((row: any) => ({
      company_name: row.companies?.name || "Unknown",
      reminder_key: row.reminder_key,
      reminder_date: row.reminder_date,
      sent_at: row.sent_at,
    }));

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
