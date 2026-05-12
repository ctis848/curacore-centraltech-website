import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  const id = params.id;

  // 1) Load the license request (including user email)
  const { data: request, error: reqError } = await supabaseAdmin
    .from("LicenseRequest")
    .select("id, userId, productName, requestKey, status, userEmail")
    .eq("id", id)
    .single();

  if (reqError || !request) {
    return NextResponse.json(
      { success: false, message: "License request not found" },
      { status: 404 }
    );
  }

  if (request.status === "APPROVED") {
    return NextResponse.json(
      { success: false, message: "Request already approved" },
      { status: 400 }
    );
  }

  if (request.status === "REJECTED") {
    return NextResponse.json(
      { success: false, message: "Request already rejected" },
      { status: 400 }
    );
  }

  // 2) Mark request as REJECTED
  const { error: updateError } = await supabaseAdmin
    .from("LicenseRequest")
    .update({ status: "REJECTED" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { success: false, message: updateError.message },
      { status: 500 }
    );
  }

  // 3) Send rejection email (if userEmail exists)
  if (request.userEmail) {
    try {
      await sendEmail({
        to: request.userEmail,
        subject: "Your License Request Was Rejected",
        html: `
          <h2>License Request Rejected</h2>
          <p>Your request for <strong>${request.productName ?? "your product"}</strong> was rejected.</p>
          <p>If you believe this is an error, please contact CentralCore Support.</p>
        `,
      });
    } catch (err) {
      console.error("Rejection email failed:", err);
      // Do not fail the whole request because of email
    }
  }

  return NextResponse.json({ success: true });
}
