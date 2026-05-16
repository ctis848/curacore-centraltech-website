import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { licenseApprovedTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { userEmail, productName, licenseKey } = await req.json();

    if (!userEmail || !productName || !licenseKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendEmail({
      to: userEmail,
      subject: "Your License Key",
      html: licenseApprovedTemplate({
        productName: productName ?? "Unknown Product",
        licenseKey,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "License resent successfully",
    });
  } catch (err) {
    console.error("Resend License Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
