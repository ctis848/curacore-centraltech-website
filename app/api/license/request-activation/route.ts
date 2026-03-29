import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { license_id, message } = body;

  if (!license_id) {
    return NextResponse.json(
      { error: "license_id is required" },
      { status: 400 }
    );
  }

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify license belongs to user
  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id, user_id")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (licenseError || !license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    );
  }

  // Create activation request
  await supabase.from("activation_requests").insert({
    license_id,
    user_id: user.id,
    message: message || "",
    status: "pending",
  });

  // Notify admin
  await sendEmail({
    to: "admin@centralcore.com",
    subject: "New License Activation Request",
    html: `
      <p>User <strong>${user.email}</strong> requested activation for license <strong>${license_id}</strong>.</p>
      <p>Message: ${message || "No message provided"}</p>
    `,
  });

  return NextResponse.json({ success: true });
}
