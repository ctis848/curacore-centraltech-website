export function contactNotificationTemplate({
  name,
  email,
  message,
  ip,
}: {
  name: string;
  email: string;
  message: string;
  ip: string;
}) {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>IP:</strong> ${ip}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    </div>
  `;
}

export function autoReplyTemplate(name: string, message: string) {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Thank you for contacting CTIS</h2>
      <p>Hello ${name},</p>
      <p>We have received your message and our team will get back to you shortly.</p>
      <hr />
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      <p style="margin-top: 20px;">Best regards,<br/>CTIS Support Team</p>
    </div>
  `;
}
