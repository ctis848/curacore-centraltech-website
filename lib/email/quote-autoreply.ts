import { emailLayout } from "./layout";

export const quoteAutoReply = (name: string) =>
  emailLayout(`
    <h2 style="color: #0A4D68;">Your Quote Request Has Been Received</h2>

    <p>Hi ${name},</p>

    <p>
      Thank you for requesting a quote from CTIS Technologies.
      Our team is reviewing your details and will contact you shortly.
    </p>

    <p style="margin-top: 20px;">
      Best regards,<br/>
      CTIS Sales Team
    </p>
  `);
