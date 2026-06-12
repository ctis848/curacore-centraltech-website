import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;

// Configure API key
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY!;

// Create API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send email using Brevo Transactional API
 */
export async function sendEmailBrevo({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL!,
    name: process.env.BREVO_SENDER_NAME!,
  };

  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, response };
  } catch (error) {
    console.error("Brevo email error:", error);
    return { success: false, error };
  }
}
