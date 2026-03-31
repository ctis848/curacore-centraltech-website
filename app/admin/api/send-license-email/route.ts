import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, licenseKey } = await req.json();

  // Replace with your real email provider (Resend, SendGrid, Mailgun, etc.)
  console.log("Sending email to:", email);
  console.log("License Key:", licenseKey);

  // Example email payload
  // await resend.emails.send({
  //   from: "support@yourapp.com",
  //   to: email,
  //   subject: "Your License Key",
  //   html: `<p>Hello ${name},</p><p>Your license key is:</p><pre>${licenseKey}</pre>`,
  // });

  return NextResponse.json({ success: true });
}
