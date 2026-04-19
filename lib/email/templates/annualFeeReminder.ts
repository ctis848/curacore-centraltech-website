import { baseEmailTemplate } from "./baseTemplate";

export function annualFeeReminderTemplate(productName: string) {
  return baseEmailTemplate({
    title: "Annual Fee Reminder",
    message: `
      <p>Hello,</p>
      <p>Your annual maintenance fee for <strong>${productName}</strong> is due soon.</p>
      <p>Please log into your client portal to complete payment.</p>
      <p>Regards,<br/>CentralCore Billing</p>
    `,
  });
}
