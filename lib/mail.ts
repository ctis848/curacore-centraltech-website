import nodemailer from "nodemailer";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured, skipping email send");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"CentralTech" <info@ctistech.com>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}
