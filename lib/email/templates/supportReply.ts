import { baseEmailTemplate } from "./baseTemplate";

export function supportReplyTemplate(reply: string, subject: string) {
  return baseEmailTemplate({
    title: `Reply to your ticket`,
    message: `
      <p>Hello,</p>
      <p>Your support ticket has a new reply:</p>
      <blockquote style="border-left:4px solid #0d6efd; padding-left:12px;">
        ${reply}
      </blockquote>
      <p>Ticket subject: <strong>${subject}</strong></p>
      <p>Regards,<br/>CentralCore Support Team</p>
    `,
  });
}
