import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/sendEmail";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { request_key } = await req.json();

  if (!request_key) {
    return NextResponse.json({ error: "Request key is required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Email to CTIS
  await sendEmail(
    "info@ctistech.com",
    "New License Activation Request",
    `A client has submitted a license activation request.

User ID: ${user.id}
Email: ${user.email}

Request Key:
${request_key}

Please generate the license manually and email it back to the client.`
  );

  // Log request
  await supabase.from("license_renewal_history").insert({
    license_id: null,
    user_id: user.id,
    action: "activation_requested",
    metadata: { request_key },
  });

  return NextResponse.json({ success: true });
}
