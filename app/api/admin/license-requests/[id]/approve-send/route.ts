import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { licenseKey } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: "Missing licenseKey" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: request, error: findError } = await supabase
      .from("licenserequest")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (findError || !request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("licenserequest")
      .update({
        licenseKey,
        status: "APPROVED",
        processedAt: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to update request" },
        { status: 500 }
      );
    }

    await sendEmail({
      to: request.userEmail,
      subject: "Your License Key",
      html: `
        <h2>Your License Has Been Approved</h2>
        <p><strong>License Key:</strong></p>
        <pre>${licenseKey}</pre>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
