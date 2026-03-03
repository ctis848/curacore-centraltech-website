import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { clientEmail, licenseKey, productName } = body;

  await resend.emails.send({
    from: "CTIS Licensing <no-reply@ctistech.com>",
    to: clientEmail,
    subject: "Your CTIS License Activation",
    html: `
      <h2>Your License is Ready</h2>
      <p>Thank you for using CTIS software.</p>

      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>License Key:</strong></p>
      <pre style="padding:10px;background:#f4f4f4;border-radius:6px;">
${licenseKey}
      </pre>

      <p>You can now activate your software using the license key above.</p>
      <p>Regards,<br/>CTIS Support Team</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
