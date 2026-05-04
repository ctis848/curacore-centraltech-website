import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  // Validate required environment variables
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("❌ Email not sent — Missing SMTP environment variables");
    return;
  }

  // Validate input
  if (!to || !subject || !html) {
    console.error("❌ Email not sent — Missing required email fields");
    return;
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

    console.log("📨 Email sent successfully:", info.messageId);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error };
  }
}
