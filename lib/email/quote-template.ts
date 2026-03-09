import { emailLayout } from "./layout";

interface QuoteTemplateProps {
  name: string;
  email: string;
  organization: string;
  details: string;
}

export const quoteTemplate = ({
  name,
  email,
  organization,
  details,
}: QuoteTemplateProps) =>
  emailLayout(`
    <h2 style="color: #0A4D68;">New Quote Request</h2>

    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Organization:</strong> ${organization}</p>

    <div class="card" style="
      margin-top: 20px;
      padding: 15px;
      background: #f7f7f7;
      border-radius: 8px;
    ">
      <p style="white-space: pre-line;">${details}</p>
    </div>
  `);
