import { SendEmailOptions } from "./types";

export async function sendEmail({ to, subject, html, attachment }: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.error("Missing BREVO_API_KEY or EMAIL_FROM in environment variables");
    throw new Error("Email configuration error");
  }

  if (!to || !subject || !html) {
    throw new Error("Missing required email fields: to, subject, html");
  }

  const payload: any = {
    sender: {
      email: from,
      name: "CentralCore Support",
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (attachment) {
    payload.attachment = [
      {
        name: attachment.name,
        content: attachment.content, // Base64
      },
    ];
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo Email Error:", errorText);
    throw new Error(`Failed to send email via Brevo: ${errorText}`);
  }

  return { success: true };
}
