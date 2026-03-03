import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.BREVO_SMTP_USER,   // your Brevo login email
      pass: process.env.BREVO_SMTP_PASS,   // your Brevo SMTP key
    },
  });

  await transporter.sendMail({
    from: "no-reply@ctistech.com",
    to: "info@ctistech.com",
    subject: `New Contact Message from ${name}`,
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
