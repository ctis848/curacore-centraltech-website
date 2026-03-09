import { emailLayout } from "./layout";

interface ContactTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const contactTemplate = ({ name, email, message }: ContactTemplateProps) =>
  emailLayout(`
    <h2 style="color: #0A4D68; font-size: 20px;">New Contact Form Message</h2>

    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>

    <div class="card" style="
      margin-top: 20px;
      padding: 15px;
      background: #f7f7f7;
      border-radius: 8px;
    ">
      <p style="white-space: pre-line;">${message}</p>
    </div>
  `);
