import { sendMail } from "@/lib/mail";

export async function GET() {
  const result = await sendMail({
    to: "info@ctistech.com",
    subject: "Brevo SMTP Test",
    html: "<p>Your Brevo SMTP email system is working.</p>",
  });

  return Response.json(result);
}
