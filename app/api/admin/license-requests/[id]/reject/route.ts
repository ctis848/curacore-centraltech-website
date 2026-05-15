import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing request ID" },
      { status: 400 }
    );
  }

  // Load request
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

  if (request.status !== "PENDING") {
    return NextResponse.json(
      { success: false, message: "Request already processed" },
      { status: 400 }
    );
  }

  // Reject request
  const { error: updateError } = await supabaseAdmin
    .from("LicenseRequest")
    .update({
      status: "REJECTED",
      processedat: new Date().toISOString(),
      processedby: "ADMIN",
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { success: false, message: updateError.message },
      { status: 500 }
    );
  }

  // Send rejection email
  if (request.userEmail) {
    try {
      await sendEmail({
        to: request.userEmail,
        subject: "Your License Request Was Rejected",
        html: `
          <h2>License Request Rejected</h2>
          <p>Your request for <strong>${request.productName}</strong> was rejected.</p>
          <p>If you believe this is an error, please contact CentralCore Support.</p>
        `,
      });
    } catch (err) {
      console.error("Rejection email failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
