import { SendEmailOptions } from "./types";

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY!;
  const from = process.env.EMAIL_FROM!;

  const payload = {
    sender: {
      email: from,
      name: "CentralCore Support",
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

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
    throw new Error("Failed to send email via Brevo");
  }
}
