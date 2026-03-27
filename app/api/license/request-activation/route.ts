import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const body = await req.json();
  const { license_id, message } = body;

  if (!license_id) {
    return NextResponse.json(
      { error: "license_id is required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  await supabase.from("activation_requests").insert({
    license_id,
    user_id: user.id,
    message: message || "",
    status: "pending",
  });

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
