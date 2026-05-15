import SibApiV3Sdk from "sib-api-v3-sdk";

export async function sendBrevoEmail({
  to,
  subject,
  html,
  attachment,
}: {
  to: string;
  subject: string;
  html: string;
  attachment?: { name: string; content: string } | null;
}) {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY!;

    const api = new SibApiV3Sdk.TransactionalEmailsApi();

    const email = new SibApiV3Sdk.SendSmtpEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: process.env.BREVO_SENDER_NAME!,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      attachment: attachment
        ? [
            {
              name: attachment.name,
              content: attachment.content,
            },
          ]
        : undefined,
    });

    const response = await api.sendTransacEmail(email);
    return { success: true, response };
  } catch (err: any) {
    console.error("Brevo email error:", err);
    return { success: false, error: err.message };
  }
}
export { sendBrevoEmail as sendEmail };
