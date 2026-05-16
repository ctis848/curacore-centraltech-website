import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, productName, licenseKey } = await req.json();

  if (!email || !productName || !licenseKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payload = {
    sender: { name: "CentralCore", email: "noreply@centralcore.com" },
    to: [{ email }],
    subject: "Your License Key",
    htmlContent: `
      <p>Your license for <strong>${productName}</strong> is ready.</p>
      <p><strong>License Key:</strong></p>
      <pre>${licenseKey}</pre>
    `,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json({ success: true, data });
}
