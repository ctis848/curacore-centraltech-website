import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { key, clientEmail } = body;

  await resend.emails.send({
    from: "CTIS Portal <no-reply@ctistech.com>",
    to: "info@ctistech.com",
    subject: "New License Activation Request",
    text: `
A client has submitted a license activation request.

Client Email: ${clientEmail}

License Request Key:
${key}

Please generate the license manually and reply to the client.
    `,
  });

  return NextResponse.json({ ok: true });
}
