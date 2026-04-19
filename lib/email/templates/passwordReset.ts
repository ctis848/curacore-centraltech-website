import { baseEmailTemplate } from "./baseTemplate";

export function passwordResetTemplate(resetLink: string) {
  return baseEmailTemplate({
    title: "Password Reset",
    message: `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below:</p>
      <p><a href="${resetLink}" style="color:#0d6efd;">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
}
