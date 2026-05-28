type ReminderType = "30days" | "7days" | "3days" | "1day" | "today" | "overdue";

const smsMap: Record<ReminderType, string> = {
  "30days":
    "CentralCore EMR: Your annual subscription will expire in 30 days. Login at www.ctistech.com, go to Renew Annual Payment and complete payment. Link: {{payment_link}}",
  "7days":
    "CentralCore EMR: Your annual subscription will expire in 7 days. Please renew to avoid interruption. Login at www.ctistech.com → Renew Annual Payment. Link: {{payment_link}}",
  "3days":
    "CentralCore EMR: Your subscription expires in 3 days. Renew now to keep access active. Link: {{payment_link}}",
  "1day":
    "CentralCore EMR: Your subscription expires tomorrow. Please renew today. Link: {{payment_link}}",
  today:
    "CentralCore EMR: Your subscription is due today. Login and renew via Renew Annual Payment. Link: {{payment_link}}",
  overdue:
    "CentralCore EMR: Your subscription is now overdue. Renew immediately to restore full access. Link: {{payment_link}}",
};

export function getRenewalSms(type: ReminderType, paymentLink: string) {
  return smsMap[type].replace("{{payment_link}}", paymentLink);
}
