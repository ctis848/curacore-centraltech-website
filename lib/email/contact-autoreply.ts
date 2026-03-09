import { emailLayout } from "./layout";

export const contactAutoReply = (name: string) =>
  emailLayout(`
    <h2 style="color: #0A4D68;">Thank You for Contacting CTIS</h2>

    <p>Hi ${name},</p>

    <p>
      We’ve received your message and our support team will get back to you shortly.
      Thank you for reaching out to CTIS Technologies.
    </p>

    <p style="margin-top: 20px;">
      Best regards,<br/>
      CTIS Support Team
    </p>
  `);
