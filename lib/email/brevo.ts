export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) {
  try {
    const recipients = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "CentralTech",
          email: "noreply@centraltech.com",
        },
        to: recipients,
        subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]+>/g, ""),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API error:", data);
      return { success: false, error: data.message || "Email failed" };
    }

    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Brevo sendEmail error:", error);
    return { success: false, error: error.message };
  }
}
