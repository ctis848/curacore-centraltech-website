import { baseEmailTemplate } from "./baseTemplate";

export function welcomeTemplate(name: string) {
  return baseEmailTemplate({
    title: "Welcome to CentralCore",
    message: `
      <p>Hello ${name},</p>
      <p>Welcome to CentralCore! Your account has been created successfully.</p>
      <p>You can now log in and start managing your licenses.</p>
      <p>Regards,<br/>CentralCore Team</p>
    `,
  });
}
