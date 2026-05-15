export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachment?: {
    name: string;
    content: string; // Base64 string
  };
}
