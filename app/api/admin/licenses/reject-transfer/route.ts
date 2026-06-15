import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { requestId, notes } = body;

  if (!requestId) {
    return NextResponse.json(
      { success: false, message: "requestId is required." },
      { status: 400 }
    );
  }

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Not authorized." },
      { status: 401 }
    );
  }

  const { data: reqRow } = await supabase
    .from("LicenseRequest")
    .select("*")
    .eq("id", requestId)
    .eq("status", "PENDING")
    .maybeSingle();

  if (!reqRow) {
    return NextResponse.json(
      { success: false, message: "Request not found or already processed." },
      { status: 404 }
    );
  }

  await supabase
    .from("LicenseRequest")
    .update({
      status: "REJECTED",
      processedAt: new Date().toISOString(),
      processedBy: admin.id,
      notes: notes ?? reqRow.notes,
    })
    .eq("id", requestId);

  return NextResponse.json({
    success: true,
    message: "Transfer request rejected.",
  });
}
