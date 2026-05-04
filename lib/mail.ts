import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: MailOptions) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  // Validate environment variables
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("❌ Email not sent — Missing SMTP environment variables");
    return { success: false, error: "Missing SMTP configuration" };
  }

  // Validate required fields
  if (!to || !subject || !html) {
    console.error("❌ Email not sent — Missing required email fields");
    return { success: false, error: "Missing email fields" };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 587, // SSL only on port 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM || `CentralTech <info@ctistech.com>`,
      to,
      subject,
      html,
    });

    console.log(`📨 Email sent successfully to ${to} — ID: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return { success: false, error: err };
  }
}
