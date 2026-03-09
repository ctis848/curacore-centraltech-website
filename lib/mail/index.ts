import nodemailer from "nodemailer";

type MailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail({ to, subject, html, text }: MailPayload) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text: text ?? "Open this email on a device that supports HTML.",
      headers: {
        "X-Entity-Ref-ID": Date.now().toString(),
      },
    });

    return { success: true, info };
  } catch (error) {
    return { success: false, error };
  }
}
